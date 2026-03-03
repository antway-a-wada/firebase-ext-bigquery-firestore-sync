/**
 * Cloud Logging 向けの軽量な構造化ロガー。
 *
 * Cloud Run 環境では、JSON で `severity` を明示すると
 * Cloud Logging 側で意図した重大度として扱われやすい。
 */
export type CloudLogSeverity =
  | 'DEFAULT'
  | 'DEBUG'
  | 'INFO'
  | 'NOTICE'
  | 'WARNING'
  | 'ERROR'
  | 'CRITICAL'
  | 'ALERT'
  | 'EMERGENCY'

/**
 * インスタンスからクラス名を取得する。
 *
 * @param instance - `this` 等のオブジェクト
 * @returns クラス名（取得できない場合は 'Unknown'）
 */
export function getClassName(instance: object): string {
  const ctor = (instance as { constructor?: { name?: string } }).constructor
  return ctor?.name ?? 'Unknown'
}

/**
 * 関数オブジェクトから名前を取得する。
 *
 * @param fn - `this.getAll` のようなメソッド参照
 * @returns 関数名（取得できない場合は 'anonymous'）
 */
export function getFunctionName(fn: unknown): string {
  if (typeof fn !== 'function') {
    return 'anonymous'
  }
  return fn.name || 'anonymous'
}

/**
 * DEBUG のログを出力する。
 *
 * @param message - ログメッセージ
 * @param options - オプション
 * @param options.details - 詳細
 * @param options.additionalPayload - 任意の追加フィールド
 * @returns void
 */
export function logDebug(
  message: string,
  options?: { details?: string; additionalPayload?: Record<string, unknown> }
): void {
  if (process.env.NODE_ENV === 'development' || process.env.APP_ENV === 'develop') {
    const payload = getPayload('DEBUG', message, options)
    console.debug(JSON.stringify(payload))
  }
}

/**
 * INFO のログを出力する。
 *
 * @param message - ログメッセージ
 * @param options - オプション
 * @param options.details - 詳細
 * @param options.additionalPayload - 任意の追加フィールド
 * @returns void
 */
export function logInfo(
  message: string,
  options?: { details?: string; additionalPayload?: Record<string, unknown> }
): void {
  const payload = getPayload('INFO', message, options)
  console.info(JSON.stringify(payload))
}

/**
 * NOTICE のログを出力する。
 *
 * @param message - ログメッセージ
 * @param options - オプション
 * @param options.details - 詳細
 * @param options.additionalPayload - 任意の追加フィールド
 * @returns void
 */
export function logNotice(
  message: string,
  options?: { details?: string; additionalPayload?: Record<string, unknown> }
): void {
  const payload = getPayload('NOTICE', message, options)
  console.log(JSON.stringify(payload))
}

/**
 * WARNING のログを出力する。
 *
 * @param message - ログメッセージ
 * @param options - オプション
 * @param options.details - 詳細
 * @param options.error - エラーオブジェクト
 * @param options.additionalPayload - 任意の追加フィールド
 * @returns void
 */
export function logWarning(
  message: string,
  options?: { details?: string; error?: Error; additionalPayload?: Record<string, unknown> }
): void {
  const payload = getPayload('WARNING', message, options)
  console.warn(JSON.stringify(payload))
}

/**
 * ERROR のログを出力する。
 *
 * @param message - ログメッセージ
 * @param options - オプション
 * @param options.details - 詳細
 * @param options.error - エラーオブジェクト
 * @param options.additionalPayload - 任意の追加フィールド
 * @returns void
 */
export function logError(
  message: string,
  options?: { details?: string; error?: Error; additionalPayload?: Record<string, unknown> }
): void {
  const payload = getPayload('ERROR', message, options)
  console.error(JSON.stringify(payload))
}

/**
 * ALERT のログを出力する。
 * 明示的にアラートを飛ばすべき場合に使用する。
 * ※ClougMonitoringのアラートで拾う
 *
 * @param message - ログメッセージ
 * @param options - オプション
 * @param options.details - 詳細
 * @param options.error - エラーオブジェクト
 * @param options.additionalPayload - 任意の追加フィールド
 * @returns void
 */
export function logAlert(
  message: string,
  options?: { details?: string; error?: Error; additionalPayload?: Record<string, unknown> }
): void {
  const payload = getPayload('ALERT', message, options)
  console.error(JSON.stringify(payload))
}

function getPayload(
  severity: CloudLogSeverity,
  message: string,
  options?: { details?: string; error?: Error; additionalPayload?: Record<string, unknown> }
): Record<string, unknown> {
  const payload: Record<string, unknown> = { severity, message }
  if (options?.details) {
    payload.details = options.details
  }
  if (options?.error) {
    payload.error = options.error
  }
  if (options?.additionalPayload) {
    payload.variables = options.additionalPayload
  }
  return payload
}
