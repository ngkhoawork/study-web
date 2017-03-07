
const initialState = {
  values: {
    filters: [],
  },
  studies: [
    {
      status: 'active',
      studyInfo: {
        id: '2835542',
        percentage: '90%',
        members: ['Bruce Wayne', 'Oliver Queen', 'Austin Baron'],
        color: 'RED',
      },
      siteInfo: {
        name: 'Catalina Research Institute',
        siteNumber: 'ABC123',
        protocol: 'A4091059',
        sponsor: 'Pfizer',
        cro: 'inVentiv Health',
        lastLogin: '02/23/2016 at 5:30 PM',
      },
      indication: ['Acne', 'Tier 2'],
      location: '359 East Main Street Suite 3i Mt: Kisco, NY 10549',
      exposureLevel: 'Platinum',
      goal: 50,
      patients: {
        today: 153,
        yesterday: 513,
        campaign: 1237,
        grandTotal: 85,
      },
      days: {
        totalDays: 60,
        daysRan: 34,
        daysLeft: 26,
      },
      campaign: {
        name: 'Run #2',
        startDate: '01/06/16',
        endDate: '01/07/06',
      },
      pageViews: 111,
      facebookClicks: 3,
      rewards: 10,
      credits: 111,
      texts: {
        sent: 23,
        received: 2,
        unread: 3,
      },
      newPatient: 3,
      callAttempted: 4,
      notQualified: 3,
      actionNeeded: 3,
      scheduled: 12,
      consented: 9,
      randomized: 2,
    }, {
      status: 'active',
      studyInfo: {
        id: '2835543',
        percentage: '70%',
        members: ['Ray Palmer', 'Slade Wilson', 'Austin Baron'],
        color: 'YELLOW',
      },
      siteInfo: {
        name: 'Catalina Research Institute',
        siteNumber: 'ABC123',
        protocol: 'A4091059',
        sponsor: 'Pfizer',
        cro: 'inVentiv Health',
        lastLogin: '02/23/2016 at 5:30 PM',
      },
      indication: ['Back Pain', 'Tier 3'],
      location: '455 East Main Street Suite 4i Mt: Kisco, NY 10549',
      exposureLevel: 'Platinum',
      goal: 70,
      patients: {
        today: 153,
        yesterday: 513,
        campaign: 1237,
        grandTotal: 85,
      },
      days: {
        totalDays: 60,
        daysRan: 34,
        daysLeft: 26,
      },
      campaign: {
        name: 'Run #2',
        startDate: '01/06/16',
        endDate: '01/07/06',
      },
      pageViews: 111,
      facebookClicks: 3,
      rewards: 10,
      credits: 111,
      texts: {
        sent: 23,
        received: 2,
        unread: 3,
      },
      newPatient: 3,
      callAttempted: 4,
      notQualified: 3,
      actionNeeded: 3,
      scheduled: 12,
      consented: 9,
      randomized: 2,
    }, {
      status: 'active',
      studyInfo: {
        id: '2835544',
        percentage: '80%',
        members: ['Selina Kyle', 'Penny Worth', 'Austin Baron'],
        color: 'GREEN',
      },
      siteInfo: {
        name: 'Catalina Research Institute',
        siteNumber: 'ABC123',
        protocol: 'A4091059',
        sponsor: 'Pfizer',
        cro: 'inVentiv Health',
        lastLogin: '02/23/2016 at 5:30 PM',
      },
      indication: ['Migraine', 'Tier 1'],
      location: '145 East Main Street Suite 5i Mt: Kisco, NY 10549',
      exposureLevel: 'Platinum',
      goal: 120,
      patients: {
        today: 153,
        yesterday: 513,
        campaign: 1237,
        grandTotal: 85,
      },
      days: {
        totalDays: 60,
        daysRan: 34,
        daysLeft: 26,
      },
      campaign: {
        name: 'Run #2',
        startDate: '01/06/16',
        endDate: '01/07/06',
      },
      pageViews: 111,
      facebookClicks: 3,
      rewards: 10,
      credits: 111,
      texts: {
        sent: 23,
        received: 2,
        unread: 3,
      },
      newPatient: 3,
      callAttempted: 4,
      notQualified: 3,
      actionNeeded: 3,
      scheduled: 12,
      consented: 9,
      randomized: 2,
    }, {
      status: 'active',
      studyInfo: {
        id: '2835548',
        percentage: '70%',
        members: ['James Gordon', 'Will Graham', 'Austin Baron'],
        color: 'PURPLE',
      },
      siteInfo: {
        name: 'Catalina Research Institute',
        siteNumber: 'ABC123',
        protocol: 'A4091059',
        sponsor: 'Pfizer',
        cro: 'inVentiv Health',
        lastLogin: '02/23/2016 at 5:30 PM',
      },
      indication: ['COPD', 'Tier 3'],
      location: '213 East Main Street Suite 4i Mt: Kisco, NY 10549',
      exposureLevel: 'Gold',
      goal: 20,
      patients: {
        today: 153,
        yesterday: 513,
        campaign: 1237,
        grandTotal: 85,
      },
      days: {
        totalDays: 60,
        daysRan: 34,
        daysLeft: 26,
      },
      campaign: {
        name: 'Run #2',
        startDate: '01/06/16',
        endDate: '01/07/06',
      },
      pageViews: 111,
      facebookClicks: 3,
      rewards: 10,
      credits: 111,
      texts: {
        sent: 23,
        received: 2,
        unread: 3,
      },
      newPatient: 3,
      callAttempted: 4,
      notQualified: 3,
      actionNeeded: 3,
      scheduled: 12,
      consented: 9,
      randomized: 2,
    }, {
      status: 'active',
      studyInfo: {
        id: '2835549',
        percentage: '80%',
        members: ['Richard Hendriks', 'Mary Stuart', 'Austin Baron'],
        color: 'RED',
      },
      siteInfo: {
        name: 'Catalina Research Institute',
        siteNumber: 'ABC123',
        protocol: 'A4091059',
        sponsor: 'Pfizer',
        cro: 'inVentiv Health',
        lastLogin: '02/23/2016 at 5:30 PM',
      },
      indication: ['Ring Worm', 'Tier 1'],
      location: '359 East Main Street Suite 3i Mt: Kisco, NY 10549',
      exposureLevel: 'Gold',
      goal: 50,
      patients: {
        today: 153,
        yesterday: 513,
        campaign: 1237,
        grandTotal: 85,
      },
      days: {
        totalDays: 60,
        daysRan: 34,
        daysLeft: 26,
      },
      campaign: {
        name: 'Run #2',
        startDate: '01/06/16',
        endDate: '01/07/06',
      },
      pageViews: 111,
      facebookClicks: 3,
      rewards: 10,
      credits: 111,
      texts: {
        sent: 23,
        received: 2,
        unread: 3,
      },
      newPatient: 3,
      callAttempted: 4,
      notQualified: 3,
      actionNeeded: 3,
      scheduled: 12,
      consented: 9,
      randomized: 2,
    },
  ],

  paginationOptions: {
    hasMoreItems: true,
    page: 1,
    activeSort: null,
    activeDirection: null,
    prevSearchFilter: {},
  },
};

export default function dashboardPageReducer(state = initialState, action) {
  switch (action.type) {
    default:
      return state;
  }
}
