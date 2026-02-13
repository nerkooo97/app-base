'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BetonaraStats, BetonaraMaterial } from '@/types/betonara';
import { getUnifiedProductionStats } from '@/lib/actions/betonara-v2';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    AreaChart,
    Area,
    Legend,
    ComposedChart,
    Line,
    ReferenceLine
} from 'recharts';
import {
    Factory,
    TrendingUp,
    Layers,
    Calendar,
    FlaskConical,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    FilterX
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { format, subDays, subMonths, subYears, startOfMonth, startOfYear, endOfYear, parseISO, isValid } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { cn, formatNumber } from '@/lib/utils';
import { DatePicker } from '@/components/ui/date-picker';

interface BetonaraDashboardClientProps {
    initialStats: BetonaraStats;
    materials: BetonaraMaterial[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const MATERIAL_NAMES: Record<string, string> = {
    '01030073': 'Riječni agregat 0-4',
    '01030063': 'Kameni drobljeni 0-4',
    '01030074': 'Riječni agregat 4-8',
    '01030075': 'Riječni agregat 8-16',
    '01110045': 'Cement 42.5/52.5 N',
    '01044076': 'SF 16 (AB)',
    '01044077': 'Sika / Aditiv',
    'VODA': 'Voda'
};

export function BetonaraDashboardClient({ initialStats, materials }: BetonaraDashboardClientProps) {
    const [stats, setStats] = useState<BetonaraStats>(initialStats);
    const [loading, setLoading] = useState(false);

    // Filters
    const now = new Date();
    const [dateFrom, setDateFrom] = useState(format(subDays(now, 90), 'yyyy-MM-dd')); // Last 90 days
    const [dateTo, setDateTo] = useState(format(now, 'yyyy-MM-dd'));
    const [plant, setPlant] = useState('all');

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getUnifiedProductionStats({
                from: dateFrom ? new Date(dateFrom).toISOString() : undefined,
                to: dateTo ? new Date(dateTo).toISOString() : undefined,
                plant
            });
            setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [dateFrom, dateTo, plant]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleReset = () => {
        setDateFrom(format(startOfMonth(now), 'yyyy-MM-dd'));
        setDateTo(format(now, 'yyyy-MM-dd'));
        setPlant('all');
    };

    // Chart Data Preparation
    const plantData = Object.entries(stats.by_plant).map(([name, value]) => ({ name, value }));
    const recipeData = Object.entries(stats.by_recipe)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({ name, value }));

    const materialData = [
        ...materials.map(m => ({
            name: m.name,
            code: m.code,
            value: stats.material_consumption[m.code] || 0,
            target: stats.material_targets[m.code] || 0
        })),
        // Add materials that are consumed but not in our master list
        ...Object.entries(stats.material_consumption)
            .filter(([code]) => !materials.find(m => m.code === code))
            .map(([code, value]) => ({
                name: MATERIAL_NAMES[code] || `Nemapiran (${code})`,
                code,
                value,
                target: stats.material_targets[code] || 0
            }))
    ]
        .map(m => {
            const diff = m.value - m.target;
            const deviation = m.target > 0 ? (diff / m.target) * 100 : 0;
            return { ...m, diff, deviation };
        })
        .filter(m => m.value > 0 || m.target > 0)
        .sort((a, b) => b.value - a.value);

    // Filtered data specifically for deviation chart (only items with targets)
    const deviationData = materialData
        .filter(m => m.target > 0)
        .sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));

    // Helper function for quick date ranges
    const setQuickRange = (range: string) => {
        const now = new Date();
        let from: Date;
        let to: Date = now;

        switch (range) {
            case '7d':
                from = subDays(now, 7);
                break;
            case '15d':
                from = subDays(now, 15);
                break;
            case 'cm':
                from = startOfMonth(now);
                to = now;
                break;
            case '1m':
                from = subMonths(now, 1);
                break;
            case '3m':
                from = subMonths(now, 3);
                break;
            case '6m':
                from = subMonths(now, 6);
                break;
            case 'cy':
                from = startOfYear(now);
                to = now;
                break;
            case 'ly':
                from = startOfYear(subYears(now, 1));
                to = endOfYear(subYears(now, 1));
                break;
            default:
                from = startOfMonth(now);
        }

        setDateFrom(format(from, 'yyyy-MM-dd'));
        setDateTo(format(to, 'yyyy-MM-dd'));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header with Period Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black tracking-tighter text-foreground">Kontrolna tabla - Betonara</h1>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                        Analitika i pregled proizvodnih procesa u realnom vremenu.
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-card/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-emerald-500/10 shadow-sm self-start sm:self-center group">
                    <div className="bg-emerald-500/10 p-2 rounded-xl group-hover:scale-110 transition-transform">
                        <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Izvještajni period</span>
                        <span className="text-sm font-black tracking-tight text-foreground">
                            {format(new Date(dateFrom), 'dd.MM.yyyy')} — {format(new Date(dateTo), 'dd.MM.yyyy')}
                        </span>
                    </div>
                </div>
            </div>
            {/* Filters Row */}
            <div className="flex flex-col gap-4 bg-card/40 backdrop-blur p-6 rounded-2xl border shadow-premium">
                {/* Quick Range Buttons */}
                <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest self-center mr-2">Brzi period:</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuickRange('cm')}
                        className="h-8 text-xs font-bold bg-emerald-500/5 border-emerald-500/20 text-emerald-700 hover:bg-emerald-500/10"
                    >
                        Trenutni mjesec
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuickRange('7d')}
                        className="h-8 text-xs font-bold"
                    >
                        7 dana
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuickRange('15d')}
                        className="h-8 text-xs font-bold"
                    >
                        15 dana
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuickRange('1m')}
                        className="h-8 text-xs font-bold"
                    >
                        1 mjesec
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuickRange('3m')}
                        className="h-8 text-xs font-bold"
                    >
                        3 mjeseca
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuickRange('6m')}
                        className="h-8 text-xs font-bold"
                    >
                        6 mjeseci
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuickRange('cy')}
                        className="h-8 text-xs font-bold"
                    >
                        Trenutna godina
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuickRange('ly')}
                        className="h-8 text-xs font-bold"
                    >
                        Prošla godina
                    </Button>
                </div>

                {/* Date Inputs and Plant Filter */}
                <div className="flex flex-col md:flex-row items-end gap-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest pl-1">Od datuma</label>
                            <DatePicker
                                date={parseISO(dateFrom)}
                                setDate={(d) => setDateFrom(format(d, 'yyyy-MM-dd'))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest pl-1">Do datuma</label>
                            <DatePicker
                                date={parseISO(dateTo)}
                                setDate={(d) => setDateTo(format(d, 'yyyy-MM-dd'))}
                            />
                        </div>
                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest pl-1">Betonara</label>
                            <Select value={plant} onValueChange={setPlant}>
                                <SelectTrigger className="bg-background/50 h-10 font-medium">
                                    <SelectValue placeholder="Odaberi lokaciju" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Sve betonare</SelectItem>
                                    <SelectItem value="Betonara 1">Betonara 1</SelectItem>
                                    <SelectItem value="Betonara 2">Betonara 2</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleReset}
                            className="h-10 w-10 text-muted-foreground hover:text-destructive"
                            title="Poništi filtere"
                        >
                            <FilterX className="h-4 w-4" />
                        </Button>
                        <Button
                            onClick={fetchStats}
                            disabled={loading}
                            className="h-10 px-6 font-bold tracking-tight shadow-md"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Osvježi
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Production Card */}
                <Card className="border-none shadow-premium bg-card/60 backdrop-blur-md overflow-hidden group">
                    <CardContent className="p-0">
                        <div className="p-6 pb-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Ukupna Proizvodnja</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black tracking-tighter tabular-nums">{formatNumber(stats.total_m3, { maximumFractionDigits: 1 })}</span>
                                <span className="text-sm font-bold text-muted-foreground">m³</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-2">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-emerald-600/80 uppercase">U realnom vremenu</span>
                            </div>
                        </div>
                        <div className="h-[60px] w-full mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.daily_production.slice(-14)}>
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        fill="url(#colorTotal)"
                                        isAnimationActive={true}
                                    />
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Records Count Card */}
                <Card className="border-none shadow-premium bg-card/60 backdrop-blur-md overflow-hidden group">
                    <CardContent className="p-0">
                        <div className="p-6 pb-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Broj Zapisa</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black tracking-tighter tabular-nums">{formatNumber(stats.record_count)}</span>
                            </div>
                            <p className="text-[10px] mt-2 font-bold text-muted-foreground uppercase opacity-70">Unosa u periodu</p>
                        </div>
                        <div className="h-[60px] w-full mt-2 opacity-40 group-hover:opacity-80 transition-opacity">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.daily_production.slice(-14)}>
                                    <Bar
                                        dataKey="value"
                                        fill="#8b5cf6"
                                        radius={[2, 2, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Betonara 1 Card */}
                <Card className="border-none shadow-premium bg-card/60 backdrop-blur-md overflow-hidden">
                    <CardContent className="p-0">
                        <div className="p-6 pb-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Betonara 1</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black tracking-tighter tabular-nums">
                                            {formatNumber(stats.by_plant['Betonara 1'] || 0, { maximumFractionDigits: 1 })}
                                        </span>
                                        <span className="text-xs font-bold text-muted-foreground">m³</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-emerald-500">
                                        {(((stats.by_plant['Betonara 1'] || 0) / stats.total_m3) * 100 || 0).toFixed(0)}%
                                    </span>
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">Udjela</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 pb-6 space-y-2">
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                    style={{ width: `${((stats.by_plant['Betonara 1'] || 0) / stats.total_m3) * 100 || 0}%` }}
                                />
                            </div>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase flex justify-between">
                                <span>Primarni kapacitet</span>
                                <span className="text-emerald-600">Aktivno</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Betonara 2 Card */}
                <Card className="border-none shadow-premium bg-card/60 backdrop-blur-md overflow-hidden">
                    <CardContent className="p-0">
                        <div className="p-6 pb-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Betonara 2</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black tracking-tighter tabular-nums">
                                            {formatNumber(stats.by_plant['Betonara 2'] || 0, { maximumFractionDigits: 1 })}
                                        </span>
                                        <span className="text-xs font-bold text-muted-foreground">m³</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-orange-500">
                                        {(((stats.by_plant['Betonara 2'] || 0) / stats.total_m3) * 100 || 0).toFixed(0)}%
                                    </span>
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">Udjela</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 pb-6 space-y-2">
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-orange-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                                    style={{ width: `${((stats.by_plant['Betonara 2'] || 0) / stats.total_m3) * 100 || 0}%` }}
                                />
                            </div>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase flex justify-between">
                                <span>Sekundarni kapacitet</span>
                                <span className="text-orange-600">Aktivno</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Infographics Row */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Trend Chart (Area) */}
                <Card className="lg:col-span-2 border-none shadow-premium bg-card/60 backdrop-blur-md overflow-hidden">
                    <CardHeader className="pb-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-black tracking-tight">Trend proizvodnje</CardTitle>
                                <CardDescription className="text-xs">Dnevni volumen (m³) u odabranom periodu</CardDescription>
                            </div>
                            <Activity className="h-5 w-5 text-muted-foreground opacity-30" />
                        </div>
                    </CardHeader>
                    <CardContent className="h-[350px] p-6 pt-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.daily_production}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                    tickFormatter={(val) => format(new Date(val), 'dd.MM.yyyy')}
                                    minTickGap={20}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                    unit="m³"
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    labelFormatter={(val) => format(new Date(val), 'dd. MMMM yyyy.', { locale: hr })}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                    name="Proizvedeno"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Plant Share (Pie) */}
                <Card className="border-none shadow-premium bg-card/60 backdrop-blur-md">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-lg font-black tracking-tight">Raspodjela rada</CardTitle>
                        <CardDescription className="text-xs">Udio proizvodnje po lokacijama</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] flex flex-col justify-center">
                        <ResponsiveContainer width="100%" height="80%">
                            <PieChart>
                                <Pie
                                    data={plantData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }: any) => `${(percent * 100).toFixed(0)}%`}
                                >
                                    {plantData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Material Consumption (Premium Bar) */}
                <Card className="border-none shadow-premium bg-card/60 backdrop-blur-md overflow-hidden">
                    <CardHeader className="pb-2">
                        <div>
                            <CardTitle className="text-lg font-black tracking-tight uppercase text-foreground">Utrošak materijala</CardTitle>
                            <CardDescription className="text-xs">Ukupna masa po komponentama (kg/l)</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[500px] pt-4 px-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={materialData}
                                layout="vertical"
                                margin={{ left: 10, right: 60, top: 0, bottom: 0 }}
                            >
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={140}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                    formatter={(val: number | undefined) => [`${formatNumber(val || 0)} kg/l`, 'Količina']}
                                />
                                <Bar
                                    dataKey="value"
                                    radius={4}
                                    barSize={16}
                                    background={{ fill: '#f1f5f9' }}
                                    animationDuration={1500}
                                >
                                    {materialData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Recipes (Premium Bar) */}
                <Card className="border-none shadow-premium bg-card/60 backdrop-blur-md overflow-hidden">
                    <CardHeader className="pb-2">
                        <div>
                            <CardTitle className="text-lg font-black tracking-tight uppercase text-foreground">Najčešće Recepture</CardTitle>
                            <CardDescription className="text-xs">Top 10 receptura po volumenu (m³)</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[500px] pt-4 px-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={recipeData}
                                layout="vertical"
                                margin={{ left: 10, right: 60, top: 0, bottom: 0 }}
                            >
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={140}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                    formatter={(val: number | undefined) => [`${formatNumber(val || 0)} m³`, 'Ukupno']}
                                />
                                <Bar
                                    dataKey="value"
                                    radius={4}
                                    barSize={16}
                                    background={{ fill: '#f1f5f9' }}
                                    animationDuration={1500}
                                >
                                    {recipeData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[(index + 4) % COLORS.length]}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Deviation Analysis Row */}
            {/* <Card className="border-none shadow-premium bg-card/60 backdrop-blur-md overflow-hidden">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-black tracking-tight uppercase text-foreground">Analiza Odstupanja (Stvarno vs Teoretski)</CardTitle>
                            <CardDescription className="text-xs">Procentualno rasipanje materijala u odnosu na recepturu</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="h-[400px] pt-4 px-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                            data={deviationData} 
                            margin={{ left: 10, right: 30, top: 20, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fill: '#94a3b8' }} 
                                unit=" %"
                            />
                            <Tooltip 
                                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                formatter={(val: number | undefined) => [`${(val || 0).toFixed(2)} %`, 'Odstupanje']}
                            />
                            <ReferenceLine y={0} stroke="#cbd5e1" />
                            <Bar 
                                dataKey="deviation" 
                                radius={4} 
                                barSize={40}
                                animationDuration={1500}
                            >
                                {deviationData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={entry.deviation > 5 || entry.deviation < -5 ? '#ef4444' : entry.deviation > 2 || entry.deviation < -2 ? '#f59e0b' : '#10b981'} 
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card> */}

            {/* Bottom Section: Detailed Material Table */}
            {/* <Card className="border-none shadow-premium bg-card/60 backdrop-blur-md">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-black tracking-tight">Detaljna specifikacija i analiza utroška</CardTitle>
                            <CardDescription className="text-xs">Poređenje stvarne potrošnje sa teoretski zadatom po recepturama</CardDescription>
                        </div>
                        <Badge variant="outline" className="font-bold">
                            {materialData.length} stavki
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-y bg-muted/30">
                                    <th className="px-6 py-3 text-[10px] uppercase font-black text-muted-foreground tracking-widest">Šifra</th>
                                    <th className="px-6 py-3 text-[10px] uppercase font-black text-muted-foreground tracking-widest">Naziv materijala</th>
                                    <th className="px-6 py-3 text-[10px] uppercase font-black text-muted-foreground tracking-widest text-right">Stvarni utrošak</th>
                                    <th className="px-6 py-3 text-[10px] uppercase font-black text-muted-foreground tracking-widest text-right">Teoretski</th>
                                    <th className="px-6 py-3 text-[10px] uppercase font-black text-muted-foreground tracking-widest text-right">Razlika</th>
                                    <th className="px-6 py-3 text-[10px] uppercase font-black text-muted-foreground tracking-widest text-right">Odstupanje</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {materialData.map((m, idx) => {
                                    const isCritical = Math.abs(m.deviation) > 5;
                                    const isWarning = Math.abs(m.deviation) > 2;

                                    return (
                                        <tr key={m.code} className="hover:bg-muted/20 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-[11px] text-muted-foreground group-hover:text-foreground">
                                                {m.code}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                                    <span className="font-bold text-foreground">
                                                        {m.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-black tabular-nums">
                                                    {formatNumber(m.value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                                </span>
                                                <span className="text-[10px] ml-1 text-muted-foreground uppercase font-bold">kg/l</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-medium tabular-nums text-muted-foreground">
                                                    {formatNumber(m.target, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={cn(
                                                    "font-bold tabular-nums",
                                                    m.diff > 0 ? "text-amber-600" : m.diff < 0 ? "text-emerald-600" : "text-muted-foreground"
                                                )}>
                                                    {m.diff > 0 ? '+' : ''}{formatNumber(m.diff, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Badge 
                                                    variant={isCritical ? "destructive" : "outline"} 
                                                    className={cn(
                                                        "font-black tabular-nums min-w-[60px] justify-center",
                                                        !isCritical && isWarning && "border-amber-500 text-amber-600 bg-amber-50",
                                                        !isCritical && !isWarning && "border-emerald-500 text-emerald-600 bg-emerald-50"
                                                    )}
                                                >
                                                    {m.deviation > 0 ? '+' : ''}{m.deviation.toFixed(1)}%
                                                </Badge>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card> */}
        </div>
    );
}
