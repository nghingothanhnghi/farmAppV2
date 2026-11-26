
import * as Yup from 'yup';

export const discountSchema = Yup.object({
  amount: Yup.string()
    .defined()
    .test(
      'valid-amount',
      'Enter a valid discount amount.',
      (value) =>
        value === '' ||
        (/^\d+$/.test(value) && Number.isFinite(Number(value))),
    ),

  percent: Yup.string()
    .defined()
    .test(
      'valid-percent',
      'Percentage must be greater than 0 and at most 100.',
      (value) =>
        value === '' ||
        (/^\d+(\.\d+)?$/.test(value) &&
          Number(value) > 0 &&
          Number(value) <= 100),
    ),

  reason: Yup.string()
    .trim()
    .required('Discount reason is required.')
    .min(3, 'Reason must be at least 3 characters.'),
}).test('discount-required', function (values) {
  if (!values?.amount && !values?.percent) {
    return this.createError({
      path: 'amount',
      message: 'Enter a discount amount or percentage.',
    });
  }

  if (values.amount !== '' && values.percent !== '') {
    return this.createError({
      path: 'percent',
      message: 'Enter an amount or percentage, not both.',
    });
  }

  return true;
});

export type DiscountFormValues = Yup.InferType<typeof discountSchema>;
