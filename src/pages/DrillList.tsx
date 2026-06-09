import { useState, useMemo, useRef, useEffect } from "react";
import { useAppStore } from "@/store";
import { drillTypeMap, drillStatusMap, formatDateTime } from "@/utils";
import {
  Flame,
  Users,
  MapPin,
  Clock,
  UserCheck,
  Plus,
  Search,
  X,
  ChevronRight,
  QrCode,
  Eye,
  FileText,
  ClipboardList,
  Image as ImageIcon,
  Star,
  CalendarDays,
  Building2,
  PersonStanding,
  Timer,
  UserCircle2,
  CheckCircle,
  Upload,
  Check,
} from "lucide-react";
import type { Drill, DrillStatus, DrillType, DrillScores } from "@/types";

const drillTypeGradient: Record<DrillType, string> = {
  fire: "from-fire-500 to-fire-700",
  evacuation: "from-industrial-500 to-industrial-700",
  comprehensive: "from-purple-500 to-purple-700",
};

const drillTypeBg: Record<DrillType, string> = {
  fire: "bg-fire-50 border-fire-200",
  evacuation: "bg-industrial-50 border-industrial-200",
  comprehensive: "bg-purple-50 border-purple-200",
};

const drillTypeIcon: Record<DrillType, typeof Flame> = {
  fire: Flame,
  evacuation: PersonStanding,
  comprehensive: Building2,
};

const statusTabs: { key: "all" | DrillStatus; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "planned", label: "计划中" },
  { key: "ongoing", label: "进行中" },
  { key: "completed", label: "已完成" },
];

const typeFilters: { key: "all" | DrillType; label: string }[] = [
  { key: "all", label: "全部类型" },
  { key: "fire", label: "灭火演练" },
  { key: "evacuation", label: "疏散演练" },
  { key: "comprehensive", label: "综合演练" },
];

const detailTabs = [
  { key: "plan", label: "演练方案", icon: FileText },
  { key: "sign", label: "签到表", icon: ClipboardList },
  { key: "photo", label: "照片评语", icon: ImageIcon },
];

export default function DrillList() {
  const {
    drills,
    drillAttendees,
    updateDrill,
    setDrillPhotos,
    completeDrill,
  } = useAppStore();
  const [statusTab, setStatusTab] = useState<"all" | DrillStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | DrillType>("all");
  const [searchText, setSearchText] = useState("");
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailTab, setDetailTab] = useState("plan");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [localScores, setLocalScores] = useState<DrillScores>({
    organization: 0,
    participation: 0,
    effect: 0,
    organizationRemark: "",
    participationRemark: "",
    effectRemark: "",
  });
  const [localComment, setLocalComment] = useState("");
  const [localPhotoUrls, setLocalPhotoUrls] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDrills = useMemo(() => {
    return drills.filter((d) => {
      if (statusTab !== "all" && d.status !== statusTab) return false;
      if (typeFilter !== "all" && d.type !== typeFilter) return false;
      if (searchText && !d.title.includes(searchText) && !d.location.includes(searchText)) return false;
      return true;
    });
  }, [drills, statusTab, typeFilter, searchText]);

  const openDrawer = (drill: Drill) => {
    setSelectedDrill(drill);
    setDrawerOpen(true);
    setDetailTab("plan");
    setLocalScores({
      organization: drill.scores?.organization || 0,
      participation: drill.scores?.participation || 0,
      effect: drill.scores?.effect || 0,
      organizationRemark: drill.scores?.organizationRemark || "",
      participationRemark: drill.scores?.participationRemark || "",
      effectRemark: drill.scores?.effectRemark || "",
    });
    setLocalComment(drill.comment || "");
    setLocalPhotoUrls([...(drill.photoUrls || [])]);
    setHasUnsavedChanges(false);
  };

  const closeDrawer = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm("有未保存的修改，确认离开？离开会丢失未保存内容。");
      if (!confirmed) return;
    }
    setDrawerOpen(false);
    setHasUnsavedChanges(false);
    setTimeout(() => setSelectedDrill(null), 200);
  };

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleScoreClick = (dimension: "organization" | "participation" | "effect", value: number) => {
    if (!selectedDrill) return;
    setLocalScores((prev) => ({
      ...prev,
      [dimension]: prev[dimension] === value ? 0 : value,
    }));
    setHasUnsavedChanges(true);
  };

  const handleScoreRemarkChange = (
    dimension: "organizationRemark" | "participationRemark" | "effectRemark",
    value: string
  ) => {
    setLocalScores((prev) => ({
      ...prev,
      [dimension]: value,
    }));
    setHasUnsavedChanges(true);
  };

  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const newPhotoUrls = [...localPhotoUrls, result || `photo-${Date.now()}`].slice(0, 9);
      setLocalPhotoUrls(newPhotoUrls);
      setHasUnsavedChanges(true);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeletePhoto = (index: number) => {
    setLocalPhotoUrls((prev) => prev.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const handleSaveAll = () => {
    if (!selectedDrill) return;
    updateDrill(selectedDrill.id, {
      scores: { ...localScores },
      comment: localComment,
      photoUrls: [...localPhotoUrls],
    });
    setHasUnsavedChanges(false);
    showSuccessToast("保存成功");
  };

  const handleCompleteDrill = () => {
    if (!selectedDrill) return;
    completeDrill(selectedDrill.id);
    showSuccessToast("演练已标记为完成");
    setSelectedDrill((prev) =>
      prev
        ? {
            ...prev,
            status: "completed",
            endTime: new Date().toISOString().slice(0, 16).replace("T", " "),
          }
        : null
    );
  };

  const handleGoToPhotoTab = () => {
    setDetailTab("photo");
  };

  const drillAttendeeList = useMemo(() => {
    if (!selectedDrill) return [];
    return drillAttendees.filter((a) => a.drillId === selectedDrill.id);
  }, [drillAttendees, selectedDrill]);

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Flame className="w-7 h-7 text-fire-600" />
              演练记录
            </h1>
            <p className="text-sm text-slate-500 mt-1">管理消防演练计划、执行与签到记录</p>
          </div>
          <button className="btn-primary">
            <Plus className="w-4 h-4" />
            新建演练
          </button>
        </div>

        <div className="card p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusTab(tab.key)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    statusTab === tab.key
                      ? "bg-white text-industrial-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5">
              {typeFilters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setTypeFilter(f.key)}
                  className={`px-3 py-1 rounded-md text-sm transition-all ${
                    typeFilter === f.key
                      ? "bg-industrial-600 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative flex-1 min-w-[240px] max-w-sm ml-auto">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索演练标题或地点..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="input pl-9"
              />
            </div>
          </div>
        </div>

        {filteredDrills.length === 0 ? (
          <div className="card p-16 text-center">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">暂无匹配的演练记录</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredDrills.map((drill) => {
              const Icon = drillTypeIcon[drill.type];
              const signProgress = drill.participants > 0 ? Math.round((drill.signedCount / drill.participants) * 100) : 0;
              return (
                <div key={drill.id} className="card card-hover overflow-hidden">
                  <div className="flex">
                    <div
                      className={`w-32 flex-shrink-0 bg-gradient-to-br ${drillTypeGradient[drill.type]} p-4 flex flex-col items-center justify-center text-white`}
                    >
                      <Icon className="w-10 h-10 mb-2 opacity-95" />
                      <span className="text-xs font-medium opacity-90">{drillTypeMap[drill.type]}</span>
                    </div>

                    <div className="flex-1 p-4 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-semibold text-slate-800 truncate">{drill.title}</h3>
                            <span className={`badge ${drillStatusMap[drill.status].className} flex-shrink-0`}>
                              {drillStatusMap[drill.status].label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <CalendarDays className="w-3.5 h-3.5" />
                            <span>{drill.date}</span>
                            <span className="mx-1.5 text-slate-300">|</span>
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate">{drill.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 my-3">
                        <div className={`p-2.5 rounded-lg border ${drillTypeBg[drill.type]}`}>
                          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                            <Timer className="w-3 h-3" />
                            时长
                          </div>
                          <div className="text-base font-semibold text-slate-800">{drill.duration}<span className="text-xs font-normal text-slate-500 ml-0.5">分钟</span></div>
                        </div>
                        <div className={`p-2.5 rounded-lg border ${drillTypeBg[drill.type]}`}>
                          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                            <Users className="w-3 h-3" />
                            参与人数
                          </div>
                          <div className="text-base font-semibold text-slate-800 data-number">{drill.participants}<span className="text-xs font-normal text-slate-500 ml-0.5">人</span></div>
                        </div>
                        <div className={`p-2.5 rounded-lg border ${drillTypeBg[drill.type]}`}>
                          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                            <UserCheck className="w-3 h-3" />
                            已签到
                          </div>
                          <div className="text-base font-semibold text-slate-800 data-number">
                            {drill.signedCount}<span className="text-xs font-normal text-slate-500 ml-0.5">/ {drill.participants}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-500">签到进度</span>
                          <span className="font-medium text-slate-700 data-number">{signProgress}%</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className={`progress-fill bg-gradient-to-r ${drillTypeGradient[drill.type]}`}
                            style={{ width: `${signProgress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <UserCircle2 className="w-3.5 h-3.5" />
                          <span>组织人：{drill.organizer}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openDrawer(drill)}
                            className="btn-ghost !px-2.5 !py-1 text-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            查看详情
                          </button>
                          <button className="btn-outline !px-2.5 !py-1 text-xs">
                            <QrCode className="w-3.5 h-3.5" />
                            签到
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedDrill && (
        <>
          <div
            className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-200 ${
              drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={closeDrawer}
          />
          <div
            className={`fixed top-0 right-0 h-full w-full max-w-3xl bg-white z-50 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
              drawerOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className={`bg-gradient-to-r ${drillTypeGradient[selectedDrill.type]} p-6 text-white`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-bold truncate">{selectedDrill.title}</h2>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/20 border border-white/30">
                      {drillStatusMap[selectedDrill.status].label}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/15 border border-white/25">
                      {drillTypeMap[selectedDrill.type]}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm opacity-95">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4" />
                      {selectedDrill.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {selectedDrill.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {selectedDrill.duration} 分钟
                    </span>
                    <span className="flex items-center gap-1.5">
                      <UserCircle2 className="w-4 h-4" />
                      {selectedDrill.organizer}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeDrawer}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0 ml-4"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-5">
                <div className="bg-white/15 backdrop-blur rounded-lg p-3 border border-white/20">
                  <div className="text-xs opacity-90 mb-0.5">参与人数</div>
                  <div className="text-2xl font-bold data-number">{selectedDrill.participants}<span className="text-sm font-normal opacity-90 ml-1">人</span></div>
                </div>
                <div className="bg-white/15 backdrop-blur rounded-lg p-3 border border-white/20">
                  <div className="text-xs opacity-90 mb-0.5">已签到</div>
                  <div className="text-2xl font-bold data-number">
                    {selectedDrill.signedCount}<span className="text-sm font-normal opacity-90 ml-1">/ {selectedDrill.participants}</span>
                  </div>
                </div>
                <div className="bg-white/15 backdrop-blur rounded-lg p-3 border border-white/20">
                  <div className="text-xs opacity-90 mb-0.5">签到率</div>
                  <div className="text-2xl font-bold data-number">
                    {selectedDrill.participants > 0 ? Math.round((selectedDrill.signedCount / selectedDrill.participants) * 100) : 0}
                    <span className="text-sm font-normal opacity-90 ml-1">%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b border-slate-200 px-6 flex gap-1">
              {detailTabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setDetailTab(tab.key)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-1.5 -mb-px ${
                      detailTab === tab.key
                        ? "border-industrial-600 text-industrial-700"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {detailTab === "plan" && (
                <div className="space-y-5 animate-fade-in">
                  <div className="flex items-center gap-3">
                    {selectedDrill.status === "completed" ? (
                      <button
                        onClick={handleGoToPhotoTab}
                        className="btn-primary !py-2 text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        补充演练总结
                      </button>
                    ) : selectedDrill.status === "planned" || selectedDrill.status === "ongoing" ? (
                      <button
                        onClick={handleCompleteDrill}
                        className="btn-primary !py-2 text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        标记演练完成
                      </button>
                    ) : null}
                    {selectedDrill.endTime && (
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                        <Clock className="w-4 h-4 text-slate-500" />
                        结束时间：{selectedDrill.endTime}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="section-title mb-3">
                      <FileText className="w-5 h-5 text-industrial-600" />
                      基本信息
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="card p-4">
                        <div className="text-xs text-slate-500 mb-1">演练编号</div>
                        <div className="font-mono text-sm text-slate-800 font-medium">{selectedDrill.id.toUpperCase()}</div>
                      </div>
                      <div className="card p-4">
                        <div className="text-xs text-slate-500 mb-1">创建时间</div>
                        <div className="text-sm text-slate-800 font-medium">{selectedDrill.createdAt}</div>
                      </div>
                      <div className="card p-4">
                        <div className="text-xs text-slate-500 mb-1">演练地点</div>
                        <div className="text-sm text-slate-800 font-medium">{selectedDrill.location}</div>
                      </div>
                      <div className="card p-4">
                        <div className="text-xs text-slate-500 mb-1">组织部门</div>
                        <div className="text-sm text-slate-800 font-medium">{selectedDrill.organizer.split("-")[0]}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="section-title mb-3">
                      <ChevronRight className="w-5 h-5 text-industrial-600" />
                      演练说明
                    </h4>
                    <div className="card p-5">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        本次{drillTypeMap[selectedDrill.type]}旨在检验园区消防应急预案的可行性与有效性，提升员工消防安全意识和应急处置能力。
                        演练科目包括：火情报警、初期扑救、人员疏散、医疗救护、通讯联络等。各部门需按照预案分工，认真组织参与，
                        确保演练达到预期效果。演练结束后将进行总结评估，针对发现问题及时整改完善。
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="section-title mb-3">
                      <Users className="w-5 h-5 text-industrial-600" />
                      参演部门
                    </h4>
                    <div className="card p-4">
                      <div className="flex flex-wrap gap-2">
                        {["安环部", "物业管理部", "工程维修部", "生产部", "仓储物流部", "行政人事部"].map((dept) => (
                          <span key={dept} className="px-3 py-1 rounded-md bg-industrial-50 text-industrial-700 text-sm border border-industrial-100">
                            {dept}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {detailTab === "sign" && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="section-title">
                      <ClipboardList className="w-5 h-5 text-industrial-600" />
                      签到记录（{drillAttendeeList.length} 人）
                    </h4>
                    <button className="btn-outline !py-1.5 text-xs">
                      <UserCheck className="w-3.5 h-3.5" />
                      导出签到表
                    </button>
                  </div>

                  <div className="card overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="table-th">序号</th>
                          <th className="table-th">姓名</th>
                          <th className="table-th">部门</th>
                          <th className="table-th">签到时间</th>
                          <th className="table-th text-center">状态</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drillAttendeeList.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="table-td text-center py-12 text-slate-400">
                              <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-50" />
                              {selectedDrill.status === "planned" ? "演练尚未开始，暂无签到记录" : "暂无签到数据"}
                            </td>
                          </tr>
                        ) : (
                          drillAttendeeList.map((a, idx) => (
                            <tr key={a.id} className="table-row">
                              <td className="table-td text-slate-500 data-number">{idx + 1}</td>
                              <td className="table-td">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-industrial-100 text-industrial-700 flex items-center justify-center text-xs font-semibold">
                                    {a.userName.slice(-2)}
                                  </div>
                                  <span className="font-medium text-slate-800">{a.userName}</span>
                                </div>
                              </td>
                              <td className="table-td text-slate-600">{a.dept}</td>
                              <td className="table-td font-mono text-slate-700 data-number">{formatDateTime(a.signTime)}</td>
                              <td className="table-td text-center">
                                <span className="badge-green">
                                  <UserCheck className="w-3 h-3" />
                                  已签到
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {detailTab === "photo" && selectedDrill && (
                <div className="space-y-5 animate-fade-in pb-28">
                  <div>
                    <h4 className="section-title mb-3">
                      <Star className="w-5 h-5 text-warning-500" />
                      评分区
                    </h4>
                    <div className="card p-5 space-y-5">
                      {[
                        { key: "organization", label: "组织评分", remarkKey: "organizationRemark" as const },
                        { key: "participation", label: "参与评分", remarkKey: "participationRemark" as const },
                        { key: "effect", label: "效果评分", remarkKey: "effectRemark" as const },
                      ].map((item) => (
                        <div key={item.key}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">{item.label}</span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((n) => {
                                const scoreValue = localScores[item.key as keyof DrillScores] as number;
                                return (
                                  <button
                                    key={n}
                                    type="button"
                                    onClick={() =>
                                      handleScoreClick(
                                        item.key as "organization" | "participation" | "effect",
                                        n
                                      )
                                    }
                                    className="p-0.5 transition-transform hover:scale-110"
                                  >
                                    <Star
                                      className={`w-6 h-6 transition-colors ${
                                        n <= scoreValue
                                          ? "text-warning-500 fill-warning-500"
                                          : "text-slate-300 hover:text-warning-300"
                                      }`}
                                    />
                                  </button>
                                );
                              })}
                              <span className="ml-2 text-sm font-medium text-slate-600 w-8 text-right">
                                {(localScores[item.key as keyof DrillScores] as number) || 0}.0
                              </span>
                            </div>
                          </div>
                          <textarea
                            value={localScores[item.remarkKey] || ""}
                            onChange={(e) => handleScoreRemarkChange(item.remarkKey, e.target.value)}
                            placeholder={`请输入${item.label.slice(0, 2)}说明...`}
                            className="input min-h-[72px] resize-y text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="section-title mb-3">
                      <FileText className="w-5 h-5 text-industrial-600" />
                      综合评价
                    </h4>
                    <div className="card p-5">
                      <textarea
                        value={localComment}
                        onChange={(e) => {
                          setLocalComment(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="请输入本次演练综合评价..."
                        className="input min-h-[140px] resize-y text-sm"
                      />
                      <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                        <span>点击下方保存按钮保存修改</span>
                        <span>{localComment.length} 字</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="section-title mb-3">
                      <ImageIcon className="w-5 h-5 text-industrial-600" />
                      现场照片
                      <span className="ml-2 text-xs font-normal text-slate-400">
                        （{localPhotoUrls.length}/9）
                      </span>
                    </h4>
                    <div className="card p-5">
                      <div className="grid grid-cols-3 gap-3">
                        {localPhotoUrls.map((photo, index) => (
                          <div
                            key={index}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 bg-gradient-to-br ${drillTypeGradient[selectedDrill.type]}`}
                          >
                            <img
                              src={photo}
                              alt={`现场照片 ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/90 pointer-events-none bg-black/0">
                              <ImageIcon className="w-6 h-6 mb-0.5 opacity-80" />
                              <span className="text-[10px] font-medium opacity-90">照片 {index + 1}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(index)}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {localPhotoUrls.length < 9 && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 hover:border-industrial-400 hover:text-industrial-500 hover:bg-industrial-50 transition-all"
                          >
                            <Plus className="w-7 h-7 mb-1" />
                            <Upload className="w-4 h-4 mb-0.5" />
                            <span className="text-xs font-medium">上传照片</span>
                          </button>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAddPhoto}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div className="fixed bottom-0 left-0 right-0 max-w-3xl ml-auto p-4 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-10">
                    <button
                      type="button"
                      onClick={handleSaveAll}
                      className="w-full btn-primary !py-3 text-base font-semibold"
                    >
                      <Check className="w-5 h-5" />
                      保存评语和照片
                    </button>
                  </div>
                </div>
              )}
            </div>

            {showToast && (
              <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-fade-in">
                <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">{toastMessage}</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
