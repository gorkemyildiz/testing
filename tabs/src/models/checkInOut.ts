interface WorkSpace {
    workSpace:string,
    qrCodeCheckIn?:string,
    qrCodeCheckOut?:string,
    gpsLocation: string,
    exceptedOffsetLocation?:number,
    exceptedOffsetTime?:number

}
interface entry {
    time: string,
    type:string,

}
interface user {
    name: string,
    checklists?:[string],
    check_in_out: [CheckInOut]
}
interface CheckInOut {
    entry?:[entry],
    assigned_users:[user],
    creator:string,
    work_space:WorkSpace,
    alert_status?:string,
    create_date:string,
    check_out_time:string,
    check_in_time:string,
    repeat_time?:string
}
export type {
    WorkSpace,
    user,
    entry,
    CheckInOut
}