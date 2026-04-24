import { describe, expect, it } from 'vitest'

import {
  buildQuotaPayloadForBillingType,
  toDatetimeLocalValue,
  toRfc3339FromDatetimeLocal,
} from '../providerBillingPayload'

describe('providerBillingPayload', () => {
  const sourceRfc3339 = '2026-03-01T00:00:00.000Z'

  it('converts RFC3339 to datetime-local field value', () => {
    expect(toDatetimeLocalValue(sourceRfc3339)).toBe('2026-03-01T08:00')
  })

  it('round-trips RFC3339 through datetime-local without changing the instant', () => {
    const localValue = toDatetimeLocalValue(sourceRfc3339)
    expect(toRfc3339FromDatetimeLocal(localValue)).toBe(sourceRfc3339)
  })

  it('omits quota fields for pay_as_you_go', () => {
    expect(buildQuotaPayloadForBillingType({
      billing_type: 'pay_as_you_go',
      monthly_quota_usd: 99,
      quota_reset_day: 30,
      quota_last_reset_at: '2026-03-01T00:00',
      quota_expires_at: '2026-03-31T00:00',
    })).toEqual({})
  })

  it('omits quota fields for free_tier', () => {
    expect(buildQuotaPayloadForBillingType({
      billing_type: 'free_tier',
      monthly_quota_usd: 99,
      quota_reset_day: 30,
      quota_last_reset_at: '2026-03-01T00:00',
      quota_expires_at: '2026-03-31T00:00',
    })).toEqual({})
  })

  it('includes quota fields and RFC3339 timestamps for monthly_quota', () => {
    const quotaLastResetAt = toDatetimeLocalValue(sourceRfc3339)
    const quotaExpiresAt = toDatetimeLocalValue('2026-03-31T00:00:00.000Z')
    expect(buildQuotaPayloadForBillingType({
      billing_type: 'monthly_quota',
      monthly_quota_usd: 99,
      quota_reset_day: 30,
      quota_last_reset_at: quotaLastResetAt,
      quota_expires_at: quotaExpiresAt,
    })).toEqual({
      monthly_quota_usd: 99,
      quota_reset_day: 30,
      quota_last_reset_at: sourceRfc3339,
      quota_expires_at: '2026-03-31T00:00:00.000Z',
    })
  })

  it('omits empty optional quota timestamps for monthly_quota', () => {
    const quotaLastResetAt = toDatetimeLocalValue(sourceRfc3339)
    expect(buildQuotaPayloadForBillingType({
      billing_type: 'monthly_quota',
      monthly_quota_usd: 99,
      quota_reset_day: 30,
      quota_last_reset_at: quotaLastResetAt,
      quota_expires_at: '',
    })).toEqual({
      monthly_quota_usd: 99,
      quota_reset_day: 30,
      quota_last_reset_at: sourceRfc3339,
      quota_expires_at: undefined,
    })
  })
})
