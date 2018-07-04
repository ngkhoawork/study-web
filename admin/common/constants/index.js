import { translate } from '../../../common/utilities/localization';

export const CAMPAIGN_LENGTH_LIST = [
  { value: 1, label: `1 ${translate('common.constants.month.one')}` },
  { value: 2, label: `2 ${translate('common.constants.month.two')}` },
  { value: 3, label: `3 ${translate('common.constants.month.plural')}` },
  { value: 4, label: `4 ${translate('common.constants.month.plural')}` },
  { value: 5, label: `5 ${translate('common.constants.month.plural')}` },
  { value: 6, label: `6 ${translate('common.constants.month.plural')}` },
  { value: 7, label: `7 ${translate('common.constants.month.plural')}` },
  { value: 8, label: `8 ${translate('common.constants.month.plural')}` },
  { value: 9, label: `9 ${translate('common.constants.month.plural')}` },
  { value: 10, label: `10 ${translate('common.constants.month.plural')}` },
  { value: 11, label: `11 ${translate('common.constants.month.plural')}` },
  { value: 12, label: `12 ${translate('common.constants.month.plural')}` },
];


export const Currencies = {
  USD: 'USD',
  CAD: 'CAD',
};

export const QUALIFICATION_SUITE_PRICE = 89700;
export const CALL_TRACKING_PRICE = 24700;

export const MONTH_OPTIONS = [
  { label: translate('common.constants.jan'), value: 1 },
  { label: translate('common.constants.feb'), value: 2 },
  { label: translate('common.constants.mar'), value: 3 },
  { label: translate('common.constants.apr'), value: 4 },
  { label: translate('common.constants.may'), value: 5 },
  { label: translate('common.constants.jun'), value: 6 },
  { label: translate('common.constants.jul'), value: 7 },
  { label: translate('common.constants.aug'), value: 8 },
  { label: translate('common.constants.sep'), value: 9 },
  { label: translate('common.constants.oct'), value: 10 },
  { label: translate('common.constants.nov'), value: 11 },
  { label: translate('common.constants.dec'), value: 12 },
];

const thisYear = new Date().getFullYear();
export const YEAR_OPTIONS = [
  { label: thisYear.toString(), value: thisYear },
  { label: (thisYear + 1).toString(), value: thisYear + 1 },
  { label: (thisYear + 2).toString(), value: thisYear + 2 },
  { label: (thisYear + 3).toString(), value: thisYear + 3 },
  { label: (thisYear + 4).toString(), value: thisYear + 4 },
  { label: (thisYear + 5).toString(), value: thisYear + 5 },
  { label: (thisYear + 6).toString(), value: thisYear + 6 },
  { label: (thisYear + 7).toString(), value: thisYear + 7 },
  { label: (thisYear + 8).toString(), value: thisYear + 8 },
  { label: (thisYear + 9).toString(), value: thisYear + 9 },
  { label: (thisYear + 10).toString(), value: thisYear + 10 },
];

export const SchedulePatientModalType = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  HIDDEN: 'HIDDEN',
};

export const PrefilledThankYouPageValues = {
  visitOurWebsiteText: 'P.S.: Have a Story to Share? Earn Rewards (Including a $150 Amazon Gift Card) by Signing Up for CureUp today.',
  websiteLink: 'http://cureup.org/rewards-program/?utm_source=Dash&utm_medium=Thanks&utm_campaign=TYPage',
};
