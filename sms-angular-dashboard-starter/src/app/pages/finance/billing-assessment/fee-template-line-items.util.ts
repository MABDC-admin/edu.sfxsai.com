import type { FeeTemplate, FeeTemplateLineItem } from '../../../core/models/finance.models';

export function getFeeTemplateLineItems(template: FeeTemplate | null | undefined): FeeTemplateLineItem[] {
  return template?.lineItems?.length
    ? template.lineItems
    : template?.feeTemplateLineItems || [];
}
