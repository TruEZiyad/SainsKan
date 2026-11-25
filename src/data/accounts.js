export const DEMO_PASSWORD = '123';
export const DEFAULT_GURU = {username:'Guru Sains',password:'123',role:'guru',displayName:'Guru Sains',custom:true};

export const DEFAULT_SISWA = [
  {username:'Komet',password:'123',role:'siswa',displayName:'Komet',custom:true,
   seed:{xp:0,totalPoin:0,materiSelesai:[],streak:0,badge:[]}},
  {username:'Neutron',password:'123',role:'siswa',displayName:'Neutron',custom:true,
   seed:{xp:520,totalPoin:495,materiSelesai:['f1','f2','f3','k1','k2'],streak:2,badge:['pemula','fisikawan','akademi_sempurna']}},
  {username:'Orbit',password:'123',role:'siswa',displayName:'Orbit',custom:true,
   seed:{xp:390,totalPoin:365,materiSelesai:['f1','k1','k2','k3','a1'],streak:3,badge:['pemula','kimiawan','disiplin']}},
  {username:'Awan',password:'123',role:'siswa',displayName:'Awan',custom:true,
   seed:{xp:260,totalPoin:235,materiSelesai:['b1','b2','a1'],streak:1,badge:['pemula','biolog']}},
  {username:'Raksa',password:'123',role:'siswa',displayName:'Raksa',custom:true,
   seed:{xp:145,totalPoin:125,materiSelesai:['f1','k1'],streak:0,badge:['pemula']}},
  {username:'Supernova',password:'123',role:'siswa',displayName:'Supernova',custom:true,
   seed:{xp:80,totalPoin:60,materiSelesai:['a1'],streak:1,badge:['pemula']}}
];


export const DEFAULT_ACCOUNTS = [DEFAULT_GURU, ...DEFAULT_SISWA];
