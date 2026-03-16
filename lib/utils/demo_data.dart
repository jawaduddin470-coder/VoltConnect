class DemoData {
  static final List<Map<String, dynamic>> stations = [
    {
      'id': 'st_1',
      'name': 'Tata Power EV — Hitech City',
      'lat': 17.4486,
      'lng': 78.3908,
      'connectors': ['CCS2 50kW', 'Type2 22kW'],
      'availability': 'available',
      'queue': 0,
      'price': '₹18/kWh',
      'amenities': ['WiFi', 'Parking'],
    },
    {
      'id': 'st_2',
      'name': 'Ather Grid — Banjara Hills',
      'lat': 17.4126,
      'lng': 78.4483,
      'connectors': ['Type2 7.4kW'],
      'availability': 'available',
      'queue': 2,
      'price': '₹15/kWh',
      'amenities': ['Café', 'Parking'],
    },
    {
      'id': 'st_3',
      'name': 'HPCL EV Point — Jubilee Hills',
      'lat': 17.4323,
      'lng': 78.4128,
      'connectors': ['CCS2 22kW', 'Bharat DC 15kW'],
      'availability': 'occupied',
      'queue': 3,
      'price': '₹16/kWh',
      'amenities': ['Parking', 'Restroom'],
    },
    {
      'id': 'st_4',
      'name': 'ChargeZone — Gachibowli',
      'lat': 17.4401,
      'lng': 78.3489,
      'connectors': ['CCS2 100kW'],
      'availability': 'available',
      'queue': 1,
      'price': '₹20/kWh',
      'amenities': ['WiFi', 'Shopping'],
    },
    {
      'id': 'st_5',
      'name': 'Fortum Charge — HITEC City 2',
      'lat': 17.4490,
      'lng': 78.3812,
      'connectors': ['CHAdeMO 50kW', 'CCS2 50kW'],
      'availability': 'available',
      'queue': 0,
      'price': '₹17/kWh',
      'amenities': ['WiFi', 'Parking', 'CCTV'],
    },
  ];

  static final List<Map<String, dynamic>> communityPosts = [
    {
      'id': 'post_1',
      'user': 'Rohan Das',
      'ev': 'Nexon EV Max',
      'content': 'Just completed a 300km trip using only ChargeZone network. The 100kW at Gachibowli is incredibly fast!',
      'likes': 45,
      'comments': 12,
      'time': '2 hours ago',
    },
    {
      'id': 'post_2',
      'user': 'Sneha K',
      'ev': 'MG ZS EV',
      'content': 'Avoid the HPCL Jubilee hills station today, there is a massive queue and one machine is down.',
      'likes': 112,
      'comments': 34,
      'time': '5 hours ago',
    },
    {
      'id': 'post_3',
      'user': 'Vikram S',
      'ev': 'Ather 450X',
      'content': 'Has anyone tried the new fast charger at Banjara hills? The café next to it has great coffee while you wait.',
      'likes': 28,
      'comments': 5,
      'time': '1 day ago',
    },
  ];

  static final List<Map<String, dynamic>> pastTrips = [
    {
      'id': 'trip_1',
      'date': '12 Oct, 2023',
      'route': 'Hitech City → Vijayawada',
      'distance': '285 km',
      'energy': '34 kWh',
      'cost': '₹680',
    },
    {
      'id': 'trip_2',
      'date': '05 Oct, 2023',
      'route': 'Gachibowli → Warangal',
      'distance': '145 km',
      'energy': '18 kWh',
      'cost': '₹360',
    },
    {
      'id': 'trip_3',
      'date': '28 Sep, 2023',
      'route': 'Jubilee Hills → Airport',
      'distance': '38 km',
      'energy': '6 kWh',
      'cost': '₹120',
    },
  ];

  static final List<Map<String, dynamic>> notifications = [
    {
      'id': 'notif_1',
      'title': 'Charging Complete',
      'body': 'Your Nexon EV Max is fully charged.',
      'time': '10 mins ago',
      'read': false,
    },
    {
      'id': 'notif_2',
      'title': 'New Station Near You',
      'body': 'ChargeZone added a 100kW station in Gachibowli.',
      'time': '2 hours ago',
      'read': false,
    },
    {
      'id': 'notif_3',
      'title': 'Wallet Offer',
      'body': 'Add ₹1000 and get ₹200 extra. Valid till tomorrow.',
      'time': '1 day ago',
      'read': true,
    },
    {
      'id': 'notif_4',
      'title': 'Maintenance Alert',
      'body': 'Ather Grid at Banjara Hills will be under maintenance from 12 AM to 4 AM.',
      'time': '2 days ago',
      'read': true,
    },
    {
      'id': 'notif_5',
      'title': 'Trip Summary',
      'body': 'You saved 12kg of CO2 on your last trip! Great job.',
      'time': '1 week ago',
      'read': true,
    },
  ];

  static final Map<String, dynamic> operatorStats = {
    'totalStations': 4,
    'totalSessionsToday': 23,
    'revenueToday': '₹18,450',
    'activeAlerts': 1,
    'uptime': '99.2%',
  };
}
