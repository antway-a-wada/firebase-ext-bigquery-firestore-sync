/**
 * BigQuery operations for the extension
 */

import {BigQuery} from '@google-cloud/bigquery'

import {logInfo} from './cloudLogger'
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

  let query: string
  
  if (!config.timestampColumn) {
    // Full sync mode: no timestamp column provided
    logInfo('タイムスタンプカラムが設定されていません。全件同期モードで実行します')
    query = `
      SELECT *
      FROM ${tableRef}
    `
  } else {
    // Incremental sync mode with timestamp column
    let whereClause = ''
    if (sinceTimestamp) {
      const timestampStr = sinceTimestamp.toISOString()
      whereClause = `WHERE ${config.timestampColumn} > TIMESTAMP('${timestampStr}')`
    }
    
    query = `
      SELECT *
      FROM ${tableRef}
      ${whereClause}
      ORDER BY ${config.timestampColumn} ASC
    `
  }

  logInfo('BigQueryクエリを実行します', {additionalPayload: {query}})

  const [job] = await bigquery.createQueryJob({
    query,
    location: 'US',
  })

  logInfo('BigQueryジョブを開始しました', {additionalPayload: {jobId: job.id ?? 'unknown'}})

  const [rows] = await job.getQueryResults()

  const metadataResponse = await job.getMetadata()
  const metadata = metadataResponse[0] as
    | {statistics?: {query?: {totalBytesProcessed?: string}}}
    | undefined
  const bytesProcessed = metadata?.statistics?.query?.totalBytesProcessed
  logInfo('クエリが完了しました', {
    additionalPayload: {
      rowCount: rows.length,
      bytesProcessed: bytesProcessed ?? 'N/A',
    },
  })

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

  logInfo('BigQueryから全ドキュメントIDを取得します')

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

  logInfo('BigQueryでドキュメントIDを見つけました', {additionalPayload: {count: ids.size}})
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
