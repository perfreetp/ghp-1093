export const mockBuildings = [
  { id: "b1", name: "A座办公楼", address: "园区东路1号", floors: 12, area: 24000, riskLevel: "medium", buildYear: 2015, fireFacilities: ["自动喷淋", "烟感报警", "室内消火栓", "消防电梯"], lastInspection: "2026-05-28", createdAt: "2024-01-10", updatedAt: "2026-05-28" },
  { id: "b2", name: "B座研发楼", address: "园区东路2号", floors: 8, area: 16000, riskLevel: "high", buildYear: 2012, fireFacilities: ["自动喷淋", "烟感报警", "气体灭火", "防火卷帘"], lastInspection: "2026-06-02", createdAt: "2024-01-10", updatedAt: "2026-06-02" },
  { id: "b3", name: "C座生产车间", address: "园区南路1号", floors: 3, area: 30000, riskLevel: "high", buildYear: 2010, fireFacilities: ["自动喷淋", "烟感报警", "室外消火栓", "消防沙池"], lastInspection: "2026-05-20", createdAt: "2024-01-10", updatedAt: "2026-05-20" },
  { id: "b4", name: "D座仓储中心", address: "园区西路1号", floors: 2, area: 18000, riskLevel: "medium", buildYear: 2018, fireFacilities: ["自动喷淋", "烟感报警", "防火门"], lastInspection: "2026-06-05", createdAt: "2024-01-10", updatedAt: "2026-06-05" },
  { id: "b5", name: "E座员工宿舍", address: "园区北路1号", floors: 6, area: 12000, riskLevel: "normal", buildYear: 2020, fireFacilities: ["烟感报警", "室内消火栓", "应急照明"], lastInspection: "2026-06-01", createdAt: "2024-01-10", updatedAt: "2026-06-01" },
  { id: "b6", name: "F座食堂餐厅", address: "园区中心1号", floors: 2, area: 4000, riskLevel: "low", buildYear: 2019, fireFacilities: ["自动喷淋", "烟感报警", "厨房灭火系统"], lastInspection: "2026-06-03", createdAt: "2024-01-10", updatedAt: "2026-06-03" },
  { id: "b7", name: "G座配电中心", address: "园区南侧", floors: 1, area: 800, riskLevel: "high", buildYear: 2010, fireFacilities: ["气体灭火", "烟感报警", "温度监测"], lastInspection: "2026-05-15", createdAt: "2024-01-10", updatedAt: "2026-05-15" },
  { id: "b8", name: "H座会议中心", address: "园区东路3号", floors: 3, area: 6000, riskLevel: "low", buildYear: 2021, fireFacilities: ["自动喷淋", "烟感报警", "应急广播"], lastInspection: "2026-06-04", createdAt: "2024-01-10", updatedAt: "2026-06-04" },
];

export const mockDevices = [
  { id: "d1", buildingId: "b1", buildingName: "A座办公楼", location: "1层东侧走廊", type: "fire_extinguisher", model: "MFZ/ABC4", serialNumber: "MH-2024-001", installDate: "2024-03-15", lastCheckDate: "2026-05-15", nextCheckDate: "2026-06-15", checkCycle: "monthly", status: "normal", pressureLevel: "normal", expireDate: "2028-03-15" },
  { id: "d2", buildingId: "b1", buildingName: "A座办公楼", location: "3层西侧电梯口", type: "fire_extinguisher", model: "MFZ/ABC4", serialNumber: "MH-2024-002", installDate: "2024-03-15", lastCheckDate: "2026-05-15", nextCheckDate: "2026-06-15", checkCycle: "monthly", status: "warning", pressureLevel: "low", expireDate: "2028-03-15" },
  { id: "d3", buildingId: "b1", buildingName: "A座办公楼", location: "6层消防分区", type: "sprinkler", model: "ZSTX-15", serialNumber: "SP-2015-088", installDate: "2015-06-20", lastCheckDate: "2026-04-10", nextCheckDate: "2026-07-10", checkCycle: "quarterly", status: "normal" },
  { id: "d4", buildingId: "b2", buildingName: "B座研发楼", location: "2层服务器机房", type: "smoke_detector", model: "JTY-GD-3002", serialNumber: "SD-2012-156", installDate: "2012-09-01", lastCheckDate: "2026-03-01", nextCheckDate: "2026-06-01", checkCycle: "quarterly", status: "expired" },
  { id: "d5", buildingId: "b2", buildingName: "B座研发楼", location: "5层实验室", type: "fire_extinguisher", model: "MT/3", serialNumber: "CO2-2023-045", installDate: "2023-08-10", lastCheckDate: "2026-05-10", nextCheckDate: "2026-06-10", checkCycle: "monthly", status: "normal", pressureLevel: "normal", expireDate: "2027-08-10" },
  { id: "d6", buildingId: "b3", buildingName: "C座生产车间", location: "北区主入口", type: "fire_hydrant", model: "SN65", serialNumber: "XFS-2010-022", installDate: "2010-11-05", lastCheckDate: "2026-04-20", nextCheckDate: "2026-05-20", checkCycle: "monthly", status: "expired" },
  { id: "d7", buildingId: "b3", buildingName: "C座生产车间", location: "焊接作业区", type: "fire_extinguisher", model: "MFZ/ABC8", serialNumber: "MH-2024-120", installDate: "2024-01-20", lastCheckDate: "2026-06-01", nextCheckDate: "2026-07-01", checkCycle: "monthly", status: "normal", pressureLevel: "normal", expireDate: "2029-01-20" },
  { id: "d8", buildingId: "b4", buildingName: "D座仓储中心", location: "1层货架区A", type: "sprinkler", model: "ZSTZ-20", serialNumber: "SP-2018-233", installDate: "2018-05-12", lastCheckDate: "2026-05-01", nextCheckDate: "2026-08-01", checkCycle: "quarterly", status: "normal" },
  { id: "d9", buildingId: "b5", buildingName: "E座员工宿舍", location: "3层301室门口", type: "smoke_detector", model: "JTY-GF-GST104", serialNumber: "SD-2020-445", installDate: "2020-09-15", lastCheckDate: "2026-06-01", nextCheckDate: "2026-09-01", checkCycle: "quarterly", status: "normal" },
  { id: "d10", buildingId: "b6", buildingName: "F座食堂餐厅", location: "后厨操作间", type: "fire_extinguisher", model: "MFTZ/ABC35", serialNumber: "TC-2023-012", installDate: "2023-06-08", lastCheckDate: "2026-06-03", nextCheckDate: "2026-07-03", checkCycle: "monthly", status: "normal", pressureLevel: "normal", expireDate: "2027-06-08" },
  { id: "d11", buildingId: "b7", buildingName: "G座配电中心", location: "高压室", type: "fire_alarm", model: "JB-QB-GST200", serialNumber: "FA-2010-007", installDate: "2010-08-20", lastCheckDate: "2026-05-15", nextCheckDate: "2026-06-15", checkCycle: "monthly", status: "maintenance", remark: "主板维修中，预计6月12日恢复" },
  { id: "d12", buildingId: "b8", buildingName: "H座会议中心", location: "多功能厅", type: "fire_hydrant", model: "SNW65", serialNumber: "XFS-2021-099", installDate: "2021-03-22", lastCheckDate: "2026-06-04", nextCheckDate: "2026-07-04", checkCycle: "monthly", status: "normal" },
];

export const mockInspections = [
  { id: "i1", title: "6月上旬日常巡检", type: "daily", status: "in_progress", inspectorId: "u3", inspectorName: "王巡检", buildingIds: ["b1", "b2"], pointIds: ["p1", "p2", "p3", "p4", "p5"], startDate: "2026-06-08", endDate: "2026-06-10", progress: 60, createdAt: "2026-06-07", creatorName: "张安全" },
  { id: "i2", title: "C栋车间周度专项检查", type: "weekly", status: "pending", inspectorId: "u5", inspectorName: "孙巡检", buildingIds: ["b3"], pointIds: ["p6", "p7"], startDate: "2026-06-12", endDate: "2026-06-12", progress: 0, createdAt: "2026-06-08", creatorName: "李物业" },
  { id: "i3", title: "5月月度全面巡检", type: "monthly", status: "completed", inspectorId: "u3", inspectorName: "王巡检", buildingIds: ["b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8"], pointIds: ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"], startDate: "2026-05-25", endDate: "2026-05-30", completeDate: "2026-05-30", progress: 100, createdAt: "2026-05-20", creatorName: "张安全" },
  { id: "i4", title: "配电房专项排查", type: "special", status: "overdue", inspectorId: "u5", inspectorName: "孙巡检", buildingIds: ["b7"], pointIds: [], startDate: "2026-06-01", endDate: "2026-06-03", progress: 40, createdAt: "2026-05-30", creatorName: "张安全" },
  { id: "i5", title: "食堂后厨防火检查", type: "weekly", status: "completed", inspectorId: "u3", inspectorName: "王巡检", buildingIds: ["b6"], pointIds: [], startDate: "2026-06-03", endDate: "2026-06-03", completeDate: "2026-06-03", progress: 100, createdAt: "2026-06-02", creatorName: "周主管" },
  { id: "i6", title: "宿舍区消防通道检查", type: "daily", status: "completed", inspectorId: "u5", inspectorName: "孙巡检", buildingIds: ["b5"], pointIds: [], startDate: "2026-06-06", endDate: "2026-06-06", completeDate: "2026-06-06", progress: 100, createdAt: "2026-06-05", creatorName: "李物业" },
];

export const mockHazards = [
  { id: "h1", title: "B2层机房烟感探测器失效", description: "B座研发楼2层机房东南角烟感探测器按下测试按钮无报警信号反馈。", level: "major", status: "rectifying", buildingId: "b2", buildingName: "B座研发楼", location: "2层机房东南区", photos: ["ph1"], reporterId: "u3", reporterName: "王巡检", reportTime: "2026-06-05 14:30", responsibleId: "u4", responsibleName: "赵整改", responsibleDept: "工程维修部", deadline: "2026-06-12", history: [{ status: "已登记", time: "2026-06-05 14:30", operator: "王巡检" }, { status: "已指派", time: "2026-06-05 16:00", operator: "张安全" }] },
  { id: "h2", title: "C栋车间消防通道堆物", description: "C座生产车间北区安全通道堆放原材料纸箱，影响紧急疏散。", level: "larger", status: "reviewing", buildingId: "b3", buildingName: "C座生产车间", location: "北区安全出口", photos: ["ph2"], reporterId: "u5", reporterName: "孙巡检", reportTime: "2026-06-04 09:15", responsibleId: "u6", responsibleName: "钱工程", responsibleDept: "工程维修部", deadline: "2026-06-08", rectifyMeasures: "已协调生产部将原材料转移至指定堆放区。", rectifyDate: "2026-06-06", history: [{ status: "已登记", time: "2026-06-04 09:15", operator: "孙巡检" }, { status: "已指派", time: "2026-06-04 10:00", operator: "李物业" }, { status: "整改完成", time: "2026-06-06 15:40", operator: "钱工程" }] },
  { id: "h3", title: "A座3层灭火器压力不足", description: "A座办公楼3层西侧电梯口灭火器压力表指针在红色区域。", level: "general", status: "pending", buildingId: "b1", buildingName: "A座办公楼", location: "3层西侧电梯口", photos: ["ph3"], reporterId: "u3", reporterName: "王巡检", reportTime: "2026-06-08 10:20", responsibleId: "", responsibleName: "待指派", responsibleDept: "", deadline: "2026-06-15", history: [{ status: "已登记", time: "2026-06-08 10:20", operator: "王巡检" }] },
  { id: "h4", title: "D栋仓储区应急照明故障", description: "D座仓储中心1层A区南侧应急照明灯持续闪烁。", level: "general", status: "closed", buildingId: "b4", buildingName: "D座仓储中心", location: "1层A区南侧", photos: ["ph4"], reporterId: "u5", reporterName: "孙巡检", reportTime: "2026-05-28 11:00", responsibleId: "u4", responsibleName: "赵整改", responsibleDept: "工程维修部", deadline: "2026-06-02", rectifyMeasures: "更换全新应急照明灯具3组。", rectifyDate: "2026-05-31", reviewerId: "u2", reviewerName: "李物业", reviewDate: "2026-06-01", reviewResult: "pass", reviewRemark: "现场复核照明正常，验收通过。", history: [{ status: "已登记", time: "2026-05-28 11:00", operator: "孙巡检" }, { status: "已指派", time: "2026-05-28 14:00", operator: "李物业" }, { status: "整改完成", time: "2026-05-31 16:20", operator: "赵整改" }, { status: "复查通过", time: "2026-06-01 09:30", operator: "李物业" }] },
  { id: "h5", title: "G座配电房气体灭火过期", description: "G座配电中心高压室七氟丙烷灭火系统钢瓶检验有效期已于2026年4月到期。", level: "major", status: "pending", buildingId: "b7", buildingName: "G座配电中心", location: "高压室", photos: ["ph5"], reporterId: "u3", reporterName: "王巡检", reportTime: "2026-06-06 15:00", responsibleId: "", responsibleName: "待指派", responsibleDept: "", deadline: "2026-06-10", history: [{ status: "已登记", time: "2026-06-06 15:00", operator: "王巡检" }] },
];

export const mockDrills = [
  { id: "dr1", title: "2026年第二季度消防综合演练", type: "comprehensive", status: "completed", date: "2026-05-28 14:00", location: "B座研发楼前广场", duration: 120, participants: 180, signedCount: 168, photos: ["dr1-1"], evaluation: "演练整体效果良好，各部门配合默契，疏散时间3分40秒达标。", organizer: "安环部-张安全", createdAt: "2026-05-20" },
  { id: "dr2", title: "C栋车间应急疏散演练", type: "evacuation", status: "completed", date: "2026-04-15 10:00", location: "C座生产车间", duration: 45, participants: 120, signedCount: 115, photos: ["dr2-1"], evaluation: "疏散路线清晰，员工参与度高。", organizer: "安环部-李物业", createdAt: "2026-04-10" },
  { id: "dr3", title: "配电室初期灭火演练", type: "fire", status: "planned", date: "2026-06-18 09:30", location: "G座配电中心", duration: 60, participants: 40, signedCount: 0, photos: [], evaluation: "", organizer: "安环部-张安全", createdAt: "2026-06-05" },
  { id: "dr4", title: "员工宿舍夜间疏散演练", type: "evacuation", status: "planned", date: "2026-06-25 22:00", location: "E座员工宿舍", duration: 30, participants: 200, signedCount: 0, photos: [], evaluation: "", organizer: "物业管理部-周主管", createdAt: "2026-06-08" },
  { id: "dr5", title: "第一季度消防演练", type: "comprehensive", status: "completed", date: "2026-03-15 14:00", location: "园区中心广场", duration: 150, participants: 320, signedCount: 305, photos: ["dr5-1"], evaluation: "圆满完成既定科目，发现问题5项已全部整改。", organizer: "安环部-张安全", createdAt: "2026-03-08" },
];

export const mockUsers = [
  { id: "u1", name: "张安全", role: "director", dept: "安环部", phone: "13800138001", email: "zhaq@park.com", avatar: "ZA" },
  { id: "u2", name: "李物业", role: "manager", dept: "物业管理部", phone: "13800138002", email: "lwy@park.com", avatar: "LW" },
  { id: "u3", name: "王巡检", role: "inspector", dept: "安环部", phone: "13800138003", email: "wxj@park.com", avatar: "WX" },
  { id: "u4", name: "赵整改", role: "rectifier", dept: "工程维修部", phone: "13800138004", email: "zzg@park.com", avatar: "ZG" },
];

export const mockOverdueStats = [
  { dept: "安环部", inspectionOverdue: 1, hazardOverdue: 0, deviceExpired: 2 },
  { dept: "物业管理部", inspectionOverdue: 0, hazardOverdue: 1, deviceExpired: 0 },
  { dept: "工程维修部", inspectionOverdue: 0, hazardOverdue: 2, deviceExpired: 1 },
  { dept: "生产部", inspectionOverdue: 0, hazardOverdue: 1, deviceExpired: 0 },
  { dept: "仓储物流部", inspectionOverdue: 0, hazardOverdue: 0, deviceExpired: 0 },
];

export const mockMonthlyReports = [
  { month: "2025-07", inspectionTotal: 42, inspectionCompleted: 40, hazardTotal: 15, hazardClosed: 13, drillCount: 1, deviceCheckCount: 148 },
  { month: "2025-08", inspectionTotal: 40, inspectionCompleted: 39, hazardTotal: 14, hazardClosed: 12, drillCount: 1, deviceCheckCount: 145 },
  { month: "2025-09", inspectionTotal: 46, inspectionCompleted: 44, hazardTotal: 17, hazardClosed: 15, drillCount: 2, deviceCheckCount: 152 },
  { month: "2025-10", inspectionTotal: 50, inspectionCompleted: 48, hazardTotal: 20, hazardClosed: 18, drillCount: 1, deviceCheckCount: 160 },
  { month: "2025-11", inspectionTotal: 44, inspectionCompleted: 42, hazardTotal: 16, hazardClosed: 14, drillCount: 2, deviceCheckCount: 155 },
  { month: "2025-12", inspectionTotal: 48, inspectionCompleted: 47, hazardTotal: 19, hazardClosed: 17, drillCount: 3, deviceCheckCount: 165 },
  { month: "2026-01", inspectionTotal: 45, inspectionCompleted: 43, hazardTotal: 18, hazardClosed: 15, drillCount: 2, deviceCheckCount: 156 },
  { month: "2026-02", inspectionTotal: 38, inspectionCompleted: 38, hazardTotal: 12, hazardClosed: 12, drillCount: 1, deviceCheckCount: 142 },
  { month: "2026-03", inspectionTotal: 52, inspectionCompleted: 50, hazardTotal: 22, hazardClosed: 19, drillCount: 2, deviceCheckCount: 168 },
  { month: "2026-04", inspectionTotal: 48, inspectionCompleted: 46, hazardTotal: 16, hazardClosed: 14, drillCount: 1, deviceCheckCount: 158 },
  { month: "2026-05", inspectionTotal: 55, inspectionCompleted: 52, hazardTotal: 25, hazardClosed: 20, drillCount: 2, deviceCheckCount: 172 },
  { month: "2026-06", inspectionTotal: 30, inspectionCompleted: 18, hazardTotal: 12, hazardClosed: 3, drillCount: 0, deviceCheckCount: 95 },
];

export const mockOverviewStats = {
  buildingCount: 8,
  deviceCount: 128,
  inspectionRate: 87.5,
  pendingHazards: 5,
  highRiskBuildings: 3,
  pendingInspections: 8,
  pendingReviews: 3,
  overdueHazards: 2,
};

export const mockChangeLogs = [
  { id: "cl1", module: "设备台账", recordId: "d2", recordName: "A座3层灭火器", action: "update" as const, fieldName: "状态", oldValue: "正常", newValue: "预警（压力不足）", operatorId: "u3", operatorName: "王巡检", operateTime: "2026-06-08 10:20" },
  { id: "cl2", module: "隐患管理", recordId: "h2", recordName: "C栋车间通道堆物", action: "update" as const, fieldName: "状态", oldValue: "整改中", newValue: "待复查", operatorId: "u6", operatorName: "钱工程", operateTime: "2026-06-06 15:40" },
  { id: "cl3", module: "建筑档案", recordId: "b2", recordName: "B座研发楼", action: "update" as const, fieldName: "风险等级", oldValue: "中风险", newValue: "高风险", operatorId: "u1", operatorName: "张安全", operateTime: "2026-06-02 17:00" },
  { id: "cl4", module: "巡检任务", recordId: "i1", recordName: "6月上旬日常巡检", action: "create" as const, operatorId: "u1", operatorName: "张安全", operateTime: "2026-06-07 09:00" },
  { id: "cl5", module: "设备台账", recordId: "d11", recordName: "G座消防报警主机", action: "update" as const, fieldName: "状态", oldValue: "正常", newValue: "维修中", operatorId: "u4", operatorName: "赵整改", operateTime: "2026-06-05 11:30" },
  { id: "cl6", module: "隐患管理", recordId: "h4", recordName: "D栋应急照明故障", action: "update" as const, fieldName: "状态", oldValue: "待复查", newValue: "已关闭", operatorId: "u2", operatorName: "李物业", operateTime: "2026-06-01 09:30" },
];

export const mockInspectionPoints = [
  { id: "p1", buildingId: "b1", buildingName: "A座办公楼", location: "1层消防栓点位", qrCode: "QR-A1-001", items: ["消防栓压力正常", "水带完好", "玻璃无破损", "周围无遮挡"] },
  { id: "p2", buildingId: "b1", buildingName: "A座办公楼", location: "3层灭火器点位", qrCode: "QR-A3-002", items: ["灭火器压力正常", "封条完好", "在有效期内", "位置正确"] },
  { id: "p3", buildingId: "b1", buildingName: "A座办公楼", location: "6层喷淋末端", qrCode: "QR-A6-003", items: ["末端压力表读数", "放水测试正常", "阀门无锈蚀"] },
  { id: "p4", buildingId: "b2", buildingName: "B座研发楼", location: "2层机房烟感", qrCode: "QR-B2-004", items: ["烟感指示灯正常", "测试报警功能", "周围无遮挡"] },
  { id: "p5", buildingId: "b2", buildingName: "B座研发楼", location: "5层实验室", qrCode: "QR-B5-005", items: ["CO2灭火器检查", "通风系统正常", "化学品存放规范"] },
  { id: "p6", buildingId: "b3", buildingName: "C座生产车间", location: "北区入口", qrCode: "QR-CN-006", items: ["消火栓检查", "应急照明正常", "安全出口畅通"] },
  { id: "p7", buildingId: "b3", buildingName: "C座生产车间", location: "焊接区", qrCode: "QR-CW-007", items: ["防火毯完好", "灭火器足量", "作业距离合规"] },
  { id: "p8", buildingId: "b4", buildingName: "D座仓储中心", location: "A区货架", qrCode: "QR-DA-008", items: ["喷淋头无遮挡", "货物间距合规", "通道畅通"] },
];

export const mockDrillAttendees = [
  { id: "da1", drillId: "dr1", userId: "u1", userName: "张安全", dept: "安环部", signTime: "2026-05-28 13:50" },
  { id: "da2", drillId: "dr1", userId: "u2", userName: "李物业", dept: "物业管理部", signTime: "2026-05-28 13:52" },
  { id: "da3", drillId: "dr1", userId: "u3", userName: "王巡检", dept: "安环部", signTime: "2026-05-28 13:55" },
  { id: "da4", drillId: "dr1", userId: "u4", userName: "赵整改", dept: "工程维修部", signTime: "2026-05-28 13:56" },
  { id: "da5", drillId: "dr1", userId: "u5", userName: "孙巡检", dept: "安环部", signTime: "2026-05-28 13:58" },
];

export const mockTodos = [
  { id: "t1", type: "inspection", title: "完成6月上旬日常巡检（剩余2个点位）", priority: "high", deadline: "2026-06-10", relatedId: "i1", relatedName: "6月上旬日常巡检" },
  { id: "t2", type: "hazard", title: "指派：A座3层灭火器压力不足", priority: "medium", deadline: "2026-06-09", relatedId: "h3", relatedName: "A座3层灭火器压力不足" },
  { id: "t3", type: "review", title: "复查：C栋车间消防通道堆物整改", priority: "high", deadline: "2026-06-09", relatedId: "h2", relatedName: "C栋车间消防通道堆物" },
  { id: "t4", type: "hazard", title: "指派并加急处理：配电房气体灭火过期", priority: "high", deadline: "2026-06-10", relatedId: "h5", relatedName: "G座配电房气体灭火过期" },
  { id: "t5", type: "inspection", title: "开展C栋车间周度专项检查", priority: "medium", deadline: "2026-06-12", relatedId: "i2", relatedName: "C栋车间周度专项检查" },
  { id: "t6", type: "inspection", title: "月度全面巡检筹备工作", priority: "low", deadline: "2026-06-20", relatedId: "i3", relatedName: "5月月度全面巡检" },
  { id: "t7", type: "review", title: "复查：D栋仓储区应急照明（历史）", priority: "low", deadline: "2026-06-15", relatedId: "h4", relatedName: "D栋仓储区应急照明故障" },
  { id: "t8", type: "hazard", title: "B2层机房烟感探测器整改跟进", priority: "medium", deadline: "2026-06-14", relatedId: "h1", relatedName: "B2层机房烟感探测器失效" },
  { id: "t9", type: "inspection", title: "G座配电房专项排查（逾期）", priority: "high", deadline: "2026-06-03", relatedId: "i4", relatedName: "配电房专项排查" },
  { id: "t10", type: "inspection", title: "H座会议中心月度消防设施检查", priority: "low", deadline: "2026-06-18", relatedId: "b8", relatedName: "H座会议中心" },
];
