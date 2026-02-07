'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BetonaraStats, BetonaraMaterial } from '@/types/betonara';
import { getProductionStats } from '@/lib/actions/betonara';
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
    Line
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
import { format, subDays, startOfMonth } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface BetonaraDashboardClientProps {
    initialStats: BetonaraStats;
    materials: BetonaraMaterial[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

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
            const data = await getProductionStats({ 
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
            value: stats.material_consumption[m.code] || 0
        })),
        // Add materials that are consumed but not in our master list
        ...Object.entries(stats.material_consumption)
            .filter(([code]) => !materials.find(m => m.code === code))
            .map(([code, value]) => ({
                name: code === 'VODA' ? 'Voda' : `Nemapiran (${code})`,
                code,
                value
            }))
    ]
    .filter(m => m.value > 0)
    .sort((a, b) => b.value - a.value);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Filters Row */}
            <div className="flex flex-col md:flex-row items-end gap-4 bg-card/40 backdrop-blur p-6 rounded-2xl border shadow-premium">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest pl-1">Od datuma</label>
                        <Input 
                            type="date" 
                            value={dateFrom} 
                            onChange={(e) => setDateFrom(e.target.value)} 
                            className="bg-background/50 h-10"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest pl-1">Do datuma</label>
                        <Input 
                            type="date" 
                            value={dateTo} 
                            onChange={(e) => setDateTo(e.target.value)} 
                            className="bg-background/50 h-10"
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

            {/* Quick Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-premium bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-blue-600/70">Ukupna Proizvodnja</CardTitle>
                        <div className="rounded-full bg-blue-500/20 p-2 text-blue-600">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black tabular-nums">{stats.total_m3.toLocaleString()} <span className="text-sm font-medium opacity-50">m³</span></div>
                        <p className="text-[10px] mt-1 text-muted-foreground flex items-center gap-1 leading-none">
                            <ArrowUpRight className="h-3 w-3 text-emerald-500 inline" /> U realnom vremenu
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-premium bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-purple-600/70">Broj Zapisa</CardTitle>
                        <div className="rounded-full bg-purple-500/20 p-2 text-purple-600">
                            <Layers className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black tabular-nums">{stats.record_count.toLocaleString()}</div>
                        <p className="text-[10px] mt-1 text-muted-foreground leading-none italic">Ukupan broj unosa u periodu</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-premium bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-emerald-600/70">Betonara 1</CardTitle>
                        <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-600">
                            <Factory className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black tabular-nums">{(stats.by_plant['Betonara 1'] || 0).toLocaleString()} <span className="text-sm font-medium opacity-50">m³</span></div>
                        <div className="flex gap-1 mt-2">
                            <Badge variant="outline" className="text-[9px] h-4 bg-emerald-500/5 border-emerald-500/20">{(((stats.by_plant['Betonara 1'] || 0) / stats.total_m3) * 100 || 0).toFixed(0)}% Udjela</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-premium bg-gradient-to-br from-orange-500/10 to-orange-600/5 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-orange-600/70">Betonara 2</CardTitle>
                        <div className="rounded-full bg-orange-500/20 p-2 text-orange-600">
                            <Factory className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black tabular-nums">{(stats.by_plant['Betonara 2'] || 0).toLocaleString()} <span className="text-sm font-medium opacity-50">m³</span></div>
                        <div className="flex gap-1 mt-2">
                            <Badge variant="outline" className="text-[9px] h-4 bg-orange-500/5 border-orange-500/20">{(((stats.by_plant['Betonara 2'] || 0) / stats.total_m3) * 100 || 0).toFixed(0)}% Udjela</Badge>
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
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                    tickFormatter={(val) => format(new Date(val), 'dd.MM')}
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
                                <Legend verticalAlign="bottom" height={36}/>
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
                                    formatter={(val: number | undefined) => [`${(val || 0).toLocaleString()} kg/l`, 'Količina']}
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
                                    formatter={(val: number | undefined) => [`${(val || 0).toLocaleString()} m³`, 'Ukupno']}
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
            {/* Bottom Section: Detailed Material Table */}
            <Card className="border-none shadow-premium bg-card/60 backdrop-blur-md">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-black tracking-tight">Detaljna specifikacija utroška materijala</CardTitle>
                            <CardDescription className="text-xs">Kompletna lista svih utrošenih sirovina u odabranom periodu</CardDescription>
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
                                    <th className="px-6 py-3 text-[10px] uppercase font-black text-muted-foreground tracking-widest text-right">Ukupan utrošak</th>
                                    <th className="px-6 py-3 text-[10px] uppercase font-black text-muted-foreground tracking-widest text-right">Udio</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {materialData.map((m, idx) => {
                                    const totalConsumption = materialData.reduce((acc, curr) => acc + curr.value, 0);
                                    const percentage = ((m.value / totalConsumption) * 100).toFixed(1);
                                    
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
                                                    {m.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                                <span className="text-[10px] ml-1 text-muted-foreground uppercase font-bold">kg/l</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-xs font-medium text-muted-foreground">{percentage}%</span>
                                                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                                                        <div 
                                                            className="h-full bg-primary transition-all duration-500" 
                                                            style={{ width: `${percentage}%`, backgroundColor: COLORS[idx % COLORS.length] }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
