export const REGIONS = [
  { id: 'gonjiam', name: '광주시 곤지암읍', sections: '1공구, 2공구, 3공구', nx: 66, ny: 122, lat: 37.3459, lng: 127.3462 },
  { id: 'sanbuk', name: '여주시 산북면', sections: '3공구, 4공구', nx: 68, ny: 123, lat: 37.3987, lng: 127.4451 },
  { id: 'sindun', name: '이천시 신둔면', sections: '1공구', nx: 67, ny: 121, lat: 37.3035, lng: 127.4062 },
  { id: 'docheok', name: '광주시 도척면', sections: '1공구', nx: 66, ny: 121, lat: 37.3017, lng: 127.3333 },
] as const;

export type RegionId = typeof REGIONS[number]['id'];

export const FORECAST_HOURS = ['0600', '0900', '1200', '1500', '1800'] as const;

export const ALERT_REGION_KEYWORDS = ['광주', '여주', '이천', '경기도'];

export const KMA_FORECAST_URL = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';
export const KMA_ALERT_URL = 'http://apis.data.go.kr/1360000/WthrWrnInfoService/getWthrWrnList';
export const TELEGRAM_API_URL = 'https://api.telegram.org';
