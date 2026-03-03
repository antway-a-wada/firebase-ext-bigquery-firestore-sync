/**
 * BigQuery operations for the extension
 */

import {BigQuery} from '@google-cloud/bigquery'

import {ExtensionConfig} from './config'
import {BigQueryRow} from './types'

/**
 * Query BigQuery for records updated since the given timestamp
 */
export async function queryUpdatedRecords(
  config: ExtensionConfig,
  sinceTimestamp: Date | null
): Promise<BigQueryRow[]> {
  const bigquery = new BigQuery({
    projectId: config.bigqueryProjectId,
  })

  const tableRef = `\`${config.bigqueryProjectId}.${config.bigqueryDataset}.${config.bigqueryTable}\``

  let whereClause = ''
  if (sinceTimestamp) {
    const timestampStr = sinceTimestamp.toISOString()
    whereClause = `WHERE ${config.timestampColumn} > TIMESTAMP('${timestampStr}')`
  }

  const query = `
    SELECT *
    FROM ${tableRef}
    ${whereClause}
    ORDER BY ${config.timestampColumn} ASC
  `

  console.log('Executing BigQuery query:', query)

  const [job] = await bigquery.createQueryJob({
    query,
    location: 'US',
  })

  console.log(`BigQuery job ${job.id ?? 'unknown'} started.`)

  const [rows] = await job.getQueryResults()

  const metadataResponse = await job.getMetadata()
  const metadata = metadataResponse[0] as
    | {statistics?: {query?: {totalBytesProcessed?: string}}}
    | undefined
  const bytesProcessed = metadata?.statistics?.query?.totalBytesProcessed
  console.log(`Query completed. Rows: ${rows.length}, Bytes processed: ${bytesProcessed ?? 'N/A'}`)

  return rows as BigQueryRow[]
}

/**
 * Query all document IDs from BigQuery
 * Used for delete synchronization
 */
export async function queryAllDocumentIds(config: ExtensionConfig): Promise<Set<string>> {
  const bigquery = new BigQuery({
    projectId: config.bigqueryProjectId,
  })

  const tableRef = `\`${config.bigqueryProjectId}.${config.bigqueryDataset}.${config.bigqueryTable}\``

  const query = `
    SELECT DISTINCT ${config.primaryKeyColumn}
    FROM ${tableRef}
  `

  console.log('Querying all document IDs from BigQuery')

  const [job] = await bigquery.createQueryJob({
    query,
    location: 'US',
  })

  const [rows] = await job.getQueryResults()

  const ids = new Set<string>()
  for (const row of rows) {
    const rowData = row as Record<string, unknown>
    const id = String(rowData[config.primaryKeyColumn])
    if (id && id !== 'undefined') {
      ids.add(id)
    }
  }

  console.log(`Found ${ids.size} document IDs in BigQuery`)
  return ids
}

/**
 * Get the maximum timestamp from the table
 * Useful for initializing the sync state
 */
export async function getMaxTimestamp(config: ExtensionConfig): Promise<Date | null> {
  const bigquery = new BigQuery({
    projectId: config.bigqueryProjectId,
  })

  const tableRef = `\`${config.bigqueryProjectId}.${config.bigqueryDataset}.${config.bigqueryTable}\``

  const query = `
    SELECT MAX(${config.timestampColumn}) as max_timestamp
    FROM ${tableRef}
  `

  const [job] = await bigquery.createQueryJob({
    query,
    location: 'US',
  })

  const [rows] = await job.getQueryResults()

  if (rows.length === 0) {
    return null
  }

  const firstRow = rows[0] as Record<string, unknown>
  const maxTimestamp = firstRow.max_timestamp as {value: string} | null

  if (!maxTimestamp) {
    return null
  }

  return new Date(maxTimestamp.value)
}
