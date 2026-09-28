import React, { useEffect, useMemo, useState } from "react";
import {
  Activity, BarChart3, Bell, CalendarDays, CheckCircle2, ChevronDown,
  CircleDollarSign, Download, LayoutDashboard, LogOut, Menu, Search,
  Settings, ShoppingCart, Sparkles, TrendingUp, Users, X, Package,
  RefreshCw, SlidersHorizontal, FileText, UserCircle2, ShieldCheck,
  Moon, Sun, HelpCircle, MoreHorizontal, ArrowUpRight, UserPlus,
  Database, Filter, Eye, Mail, Clock3, Pencil
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Line, LineChart
} from "recharts";
import { api } from "./api";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const COLORS = ["#635bff", "#00b894", "#ffb020", "#ff5d73", "#2f80ed"];

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const login = (data) => {
    // Keep login only for the current session
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);

    // Also remove any old saved session
    localStorage.removeItem("insight_token");
    localStorage.removeItem("insight_user");
  };

  if (!token) {
    return <AuthScreen onLogin={login} />;
  }

  return (
    <Dashboard
      token={token}
      user={user}
      onLogout={logout}
    />
  );
}

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "", email: "demo@insightboard.com", password: "Demo@12345"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = mode === "login"
        ? await api.login({ email: form.email, password: form.password })
        : await api.register(form);
      onLogin(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-decoration one" />
      <div className="auth-decoration two" />
      <div className="auth-shell">
        <section className="auth-brand">
          <div className="brand-mark"><Sparkles size={23} /></div>
          <span>InsightBoard</span>
        </section>

        <section className="auth-card">
          <div className="auth-card-head">
            <div className="mini-icon"><BarChart3 size={19} /></div>
            <span className="eyebrow">ANALYTICS PLATFORM</span>
          </div>
          <h1>{mode === "login" ? "Welcome back." : "Create your account."}</h1>
          <p className="muted">
            {mode === "login"
              ? "Turn your business data into clear decisions."
              : "Start exploring your analytics workspace."}
          </p>

          <form onSubmit={submit} className="auth-form">
            {mode === "register" && (
              <label>Full name
                <input value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name" required />
              </label>
            )}
            <label>Email address
              <input type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com" required />
            </label>
            <label>Password
              <input type="password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••" required />
            </label>

            {error && <div className="error-box">{error}</div>}

            <button className="primary-btn auth-btn" disabled={loading}>
              {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          {mode === "login" && (
            <button className="demo-note demo-button"
              onClick={() => setForm({ ...form, email: "demo@insightboard.com", password: "Demo@12345" })}>
              <strong>Demo account</strong>
              <span>Click to fill demo credentials</span>
            </button>
          )}

          <div className="auth-switch">
            {mode === "login" ? "New to InsightBoard?" : "Already have an account?"}
            <button onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
              setForm({ name: "", email: "", password: "" });
            }}>
              {mode === "login" ? "Create account" : "Sign in"}
            </button>
          </div>
        </section>
        <p className="auth-footer">Secure dashboard · Built for modern teams</p>
      </div>
    </div>
  );
}

function Dashboard({ token, user, onLogout }) {
  const [data, setData] = useState(null);
  const [overview, setOverview] = useState({ categories: [], statuses: [] });
  const [filters, setFilters] = useState({ category: "All", status: "All", from: "", to: "" });
  const [activeNav, setActiveNav] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [settings, setSettings] = useState({ darkMode: false, emailAlerts: true });
  const [modal, setModal] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const load = async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const [dashboard, meta] = await Promise.all([
        api.dashboard(token, filters),
        api.overview(token)
      ]);
      setData(dashboard);
      setOverview(meta);
      if (silent) showToast("Dashboard refreshed successfully.");
    } catch (err) {
      setError(err.message || "Unable to load dashboard.");
      if (/token|authentication|expired/i.test(err.message || "")) onLogout();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [filters.category, filters.status, filters.from, filters.to]);

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(window.__insightToast);
    window.__insightToast = window.setTimeout(() => setToast(""), 2600);
  };

  const navItems = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "Analytics", icon: BarChart3 },
    { label: "Orders", icon: ShoppingCart },
    { label: "Customers", icon: Users },
    { label: "Settings", icon: Settings }
  ];

  const goTo = (label) => {
    setActiveNav(label);
    setSidebarOpen(false);
    setSearchOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
  };

  const handleSaveOrder = async (updatedOrder) => {
    if (!editingOrder?._id) {
      showToast("Unable to identify this order.");
      return;
    }

    try {
      setSavingOrder(true);
      await api.updateOrder(token, editingOrder._id, updatedOrder);
      await load(true);
      setEditingOrder(null);
      showToast("Order updated successfully.");
    } catch (err) {
      showToast(err.message || "Unable to update order.");
    } finally {
      setSavingOrder(false);
    }
  };

  const handleExport = () => {
    const orders = data?.allOrders || data?.recentOrders || [];
    if (!orders.length) return showToast("There are no orders to export.");
    const header = ["Order ID", "Customer", "Product", "Category", "Amount", "Status", "Date"];
    const rows = orders.map(o => [
      o.orderId, o.customer, o.product, o.category, o.amount, o.status,
      new Date(o.date).toLocaleDateString("en-IN")
    ]);
    const csv = [header, ...rows]
      .map(row => row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "insightboard-orders.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Orders exported as CSV.");
  };

  const allOrders = data?.allOrders || data?.recentOrders || [];
  const searchedOrders = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return allOrders;
    return allOrders.filter(o =>
      [o.orderId, o.customer, o.product, o.category, o.status]
        .some(v => String(v).toLowerCase().includes(q))
    );
  }, [allOrders, globalSearch]);

  const customers = useMemo(() => {
    const map = new Map();
    allOrders.forEach(o => {
      const old = map.get(o.customer) || { name: o.customer, orders: 0, spend: 0, last: o.date };
      old.orders += 1;
      if (o.status === "Completed") old.spend += Number(o.amount || 0);
      if (new Date(o.date) > new Date(old.last)) old.last = o.date;
      map.set(o.customer, old);
    });
    return [...map.values()].sort((a, b) => b.spend - a.spend);
  }, [allOrders]);

  const analyticsData = useMemo(() => {
    return (data?.revenueTrend || []).map(item => ({
      ...item,
      label: item.date.slice(5)
    }));
  }, [data]);

  const pageTitle = {
    Overview: "Business overview",
    Analytics: "Analytics intelligence",
    Orders: "Order management",
    Customers: "Customer insights",
    Settings: "Workspace settings"
  }[activeNav];

  return (
    <div className={`app-shell ${settings.darkMode ? "dark-mode" : ""}`}>
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="brand-mark small"><Sparkles size={18} /></div>
            <div><strong>InsightBoard</strong><small>Analytics Suite</small></div>
          </div>
          <button className="mobile-close" onClick={() => setSidebarOpen(false)}><X /></button>
        </div>

        <div className="workspace workspace-button" onClick={() => setWorkspaceOpen(v => !v)}>
          <div className="workspace-avatar">IB</div>
          <div><small>WORKSPACE</small><strong>Growth Analytics</strong></div>
          <ChevronDown size={15} className={workspaceOpen ? "rotate" : ""} />
        </div>
        {workspaceOpen && (
          <div className="workspace-menu">
            <button onClick={() => { showToast("Growth Analytics is active."); setWorkspaceOpen(false); }}>
              <BarChart3 size={15} /> Growth Analytics <CheckCircle2 size={14} />
            </button>
            <button onClick={() => { showToast("Workspace switching is ready for another workspace."); setWorkspaceOpen(false); }}>
              <Package size={15} /> Add workspace
            </button>
          </div>
        )}

        <nav className="side-nav">
          <span className="nav-title">MAIN MENU</span>
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${activeNav === label ? "active" : ""}`}
              onClick={() => goTo(label)}>
              <Icon size={18} />{label}
              {label === "Analytics" && <span className="nav-badge">Live</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon"><TrendingUp size={17} /></div>
            <strong>Insight Pro</strong>
            <p>Unlock deeper business intelligence.</p>
            <button onClick={() => setModal("pro")}>Explore features</button>
          </div>
          <button className="logout-btn" onClick={onLogout}><LogOut size={17} /> Sign out</button>
        </div>
      </aside>

      {sidebarOpen && <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />}

      <main className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}><Menu /></button>
          <div className="breadcrumb"><span>Workspace</span><b>/</b><strong>{activeNav}</strong></div>

          <div className="topbar-actions">
            <div className="top-action-wrap">
              <button className={`icon-btn ${searchOpen ? "selected" : ""}`} onClick={() => {
                setSearchOpen(v => !v); setNotificationsOpen(false); setProfileOpen(false);
              }}><Search size={18} /></button>
              {searchOpen && (
                <div className="popover search-popover">
                  <div className="search-input"><Search size={15} />
                    <input autoFocus value={globalSearch} onChange={e => setGlobalSearch(e.target.value)}
                      placeholder="Search orders, customers..." />
                  </div>
                  <div className="search-results">
                    {globalSearch && searchedOrders.slice(0, 5).map(o => (
                      <button key={o.orderId} onClick={() => { goTo("Orders"); }}>
                        <span><strong>{o.orderId}</strong><small>{o.customer} · {o.product}</small></span>
                        <ArrowUpRight size={14} />
                      </button>
                    ))}
                    {globalSearch && !searchedOrders.length && <div className="popover-empty">No matching results.</div>}
                    {!globalSearch && <div className="popover-empty">Type to search recent orders.</div>}
                  </div>
                </div>
              )}
            </div>

            <div className="top-action-wrap">
              <button className={`icon-btn notification ${notificationsOpen ? "selected" : ""}`}
                onClick={() => { setNotificationsOpen(v => !v); setSearchOpen(false); setProfileOpen(false); }}>
                <Bell size={18} /><i />
              </button>
              {notificationsOpen && (
                <div className="popover notification-popover">
                  <div className="popover-title"><strong>Notifications</strong><span>3 new</span></div>
                  <Notification icon={<TrendingUp />} title="Revenue is trending up" text="Your latest dashboard data is ready." />
                  <Notification icon={<ShoppingCart />} title="Orders updated" text={`${data?.summary?.orders || 0} orders are in the current view.`} />
                  <Notification icon={<CheckCircle2 />} title="System healthy" text="API and database are connected." />
                  <button className="popover-link" onClick={() => { setNotificationsOpen(false); showToast("All notifications marked as read."); }}>Mark all as read</button>
                </div>
              )}
            </div>

            <div className="profile profile-button" onClick={() => {
              setProfileOpen(v => !v); setSearchOpen(false); setNotificationsOpen(false);
            }}>
              <div className="profile-avatar">{(user?.name || "U").slice(0, 1).toUpperCase()}</div>
              <div className="profile-text"><strong>{user?.name || "Analyst"}</strong><span>Administrator</span></div>
              <ChevronDown size={15} className={profileOpen ? "rotate" : ""} />
            </div>
            {profileOpen && (
              <div className="popover profile-popover">
                <button onClick={() => { goTo("Settings"); }}><UserCircle2 size={16} /> My profile</button>
                <button onClick={() => { goTo("Settings"); }}><Settings size={16} /> Settings</button>
                <button onClick={() => { onLogout(); }}><LogOut size={16} /> Sign out</button>
              </div>
            )}
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">{activeNav === "Overview" ? "BUSINESS OVERVIEW" : "INSIGHTBOARD"}</div>
              <h1>
                {activeNav === "Overview"
                  ? <>Good morning, {user?.name?.split(" ")[0] || "Analyst"} <span>✦</span></>
                  : pageTitle}
              </h1>
              <p>
                {activeNav === "Overview"
                  ? "Here’s what’s happening with your business today."
                  : "Explore your business data and make faster decisions."}
              </p>
            </div>
            <div className="heading-actions">
              <button className="secondary-btn" onClick={handleExport}><Download size={16} /> Export</button>
              <button className="primary-btn" onClick={() => load(true)} disabled={refreshing}>
                <RefreshCw size={16} className={refreshing ? "spin" : ""} />
                {refreshing ? "Refreshing..." : "Refresh data"}
              </button>
            </div>
          </div>

          {activeNav !== "Settings" && (
            <div className="filter-bar">
              <div className="filter-label"><Filter size={16} /> Filter data</div>
              <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
                <option>All</option>
                {overview.categories.map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                <option>All</option>
                {overview.statuses.map(s => <option key={s}>{s}</option>)}
              </select>
              <input type="date" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })} />
              <span>to</span>
              <input type="date" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })} />
              <button className="clear-filter" onClick={() => setFilters({ category: "All", status: "All", from: "", to: "" })}>Clear</button>
            </div>
          )}

          {error && <div className="error-box page-error">{error}</div>}

          {loading && !data ? <LoadingDashboard /> : data ? (
            <>
              {activeNav === "Overview" && <OverviewView data={data} onGo={goTo} />}
              {activeNav === "Analytics" && <AnalyticsView data={data} analyticsData={analyticsData} />}
              {activeNav === "Orders" && (
                <OrdersView
                  orders={searchedOrders}
                  search={globalSearch}
                  setSearch={setGlobalSearch}
                  onExport={handleExport}
                  categories={overview.categories}
                  onEdit={handleEditOrder}
                />
              )}
              {activeNav === "Customers" && <CustomersView customers={customers} />}
              {activeNav === "Settings" && (
                <SettingsView user={user} settings={settings} setSettings={setSettings}
                  onLogout={onLogout} onToast={showToast} />
              )}
              <footer className="dashboard-footer">
                <span>InsightBoard Analytics</span>
                <span><CheckCircle2 size={14} /> Data refreshed successfully</span>
              </footer>
            </>
          ) : null}
        </div>
      </main>

      {modal && <Modal type={modal} onClose={() => setModal(null)} />}

      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          categories={overview.categories}
          saving={savingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={handleSaveOrder}
        />
      )}

      {toast && <div className="toast"><CheckCircle2 size={17} /> {toast}</div>}
    </div>
  );
}

function OverviewView({ data, onGo }) {
  return (
    <>
      <section className="kpi-grid">
        <KpiCard icon={<CircleDollarSign />} title="Total revenue" value={currency.format(data.summary.revenue)} trend="+12.8%" note="completed revenue" />
        <KpiCard icon={<ShoppingCart />} title="Total orders" value={data.summary.orders.toLocaleString()} trend="+8.4%" note="orders in current view" />
        <KpiCard icon={<Users />} title="Customers" value={data.summary.customers.toLocaleString()} trend="+5.7%" note="unique customers" />
        <KpiCard icon={<TrendingUp />} title="Avg. order value" value={currency.format(data.summary.averageOrderValue)} trend="+3.2%" note="completed orders" />
      </section>

      <section className="chart-grid">
        <div className="panel revenue-panel">
          <PanelHead title="Revenue performance" subtitle="Completed order revenue over time"
            actionLabel="View analytics" onAction={() => onGo("Analytics")} />
          <div className="chart-wrap large">
            {data.revenueTrend?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueTrend}>
                  <defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#635bff" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#635bff" stopOpacity={0} />
                  </linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f5" />
                  <XAxis dataKey="date" tickFormatter={d => d.slice(5)} axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={v => `₹${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={v => [currency.format(v), "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#635bff" strokeWidth={3} fill="url(#revenueFill)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <EmptyState />}
          </div>
        </div>

        <div className="panel">
          <PanelHead title="Sales by category" subtitle="Revenue contribution" />
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categoryData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#edf0f5" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={72} axisLine={false} tickLine={false} />
                <Tooltip formatter={v => [currency.format(v), "Revenue"]} />
                <Bar dataKey="revenue" radius={[0, 7, 7, 0]} fill="#635bff" barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="bottom-grid">
        <div className="panel">
          <PanelHead title="Order status" subtitle="Current order distribution" />
          <div className="donut-area">
            <ResponsiveContainer width="55%" height={210}>
              <PieChart>
                <Pie data={data.statusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={4}>
                  {data.statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie><Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="status-list">
              {data.statusData.map((item, i) => (
                <div className="status-row" key={item.name}>
                  <span><i style={{ background: COLORS[i % COLORS.length] }} />{item.name}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel">
          <PanelHead title="Top products" subtitle="Highest revenue generators" actionLabel="View orders" onAction={() => onGo("Orders")} />
          <div className="product-list">
            {data.topProducts.map((product, i) => (
              <div className="product-row" key={product.name}>
                <div className="product-rank">{String(i + 1).padStart(2, "0")}</div>
                <div className="product-info"><strong>{product.name}</strong><span>{product.units} orders</span></div>
                <strong>{currency.format(product.revenue)}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel table-panel">
        <div className="table-head">
          <PanelHead title="Recent orders" subtitle="Latest activity from your store" actionLabel="View all" onAction={() => onGo("Orders")} />
        </div>
        <OrdersTable orders={data.recentOrders} />
      </section>
    </>
  );
}

function AnalyticsView({ data, analyticsData }) {
  const totals = data.summary;
  return (
    <div className="analytics-page">
      <section className="insight-banner">
        <div className="insight-icon"><Sparkles size={21} /></div>
        <div><strong>Analytics snapshot</strong><p>Use the filters above to compare different segments of your business data.</p></div>
        <span className="live-dot"><i /> Live data</span>
      </section>

      <section className="kpi-grid">
        <KpiCard icon={<CircleDollarSign />} title="Revenue" value={currency.format(totals.revenue)} trend="+12.8%" note="completed revenue" />
        <KpiCard icon={<ShoppingCart />} title="Orders" value={totals.orders} trend="+8.4%" note="all order statuses" />
        <KpiCard icon={<Users />} title="Customers" value={totals.customers} trend="+5.7%" note="unique customers" />
        <KpiCard icon={<TrendingUp />} title="AOV" value={currency.format(totals.averageOrderValue)} trend="+3.2%" note="average completed order" />
      </section>

      <section className="chart-grid">
        <div className="panel">
          <PanelHead title="Revenue & order trend" subtitle="Daily performance in the selected period" />
          <div className="chart-wrap analytics-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f5" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#635bff" strokeWidth={3} dot={false} name="Revenue" />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#00b894" strokeWidth={2} dot={false} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel">
          <PanelHead title="Category mix" subtitle="Revenue by product category" />
          <div className="chart-wrap analytics-chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.categoryData} dataKey="revenue" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={3}>
                  {data.categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => currency.format(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="panel">
        <PanelHead title="Performance by category" subtitle="Revenue and order volume" />
        <div className="category-performance">
          {data.categoryData.map((item, i) => (
            <div className="performance-row" key={item.name}>
              <div className="performance-name"><i style={{ background: COLORS[i % COLORS.length] }} /> <strong>{item.name}</strong></div>
              <div className="progress-track"><span style={{ width: `${Math.min(100, item.revenue / Math.max(...data.categoryData.map(x => x.revenue), 1) * 100)}%`, background: COLORS[i % COLORS.length] }} /></div>
              <strong>{currency.format(item.revenue)}</strong>
              <span>{item.orders} orders</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function OrdersView({
  orders,
  search,
  setSearch,
  onExport,
  categories = [],
  onEdit
}) {
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");

  const visible = orders.filter(order => {
    const statusMatch =
      status === "All" || order.status === status;

    const categoryMatch =
      category === "All" || order.category === category;

    return statusMatch && categoryMatch;
  });

  return (
    <section className="panel orders-page">

      <div className="section-toolbar">
        <div>
          <h3>Orders</h3>
          <p>Search and review recent order activity.</p>
        </div>

        <button
          className="primary-btn"
          onClick={onExport}
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      <div className="orders-controls">

        {/* SEARCH */}
        <div className="search-input wide">
          <Search size={15} />

          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search order, customer or product..."
          />
        </div>


        {/* CATEGORY FILTER */}
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="All">All Categories</option>

          {categories.map(item => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>


        {/* STATUS FILTER */}
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Refunded">Refunded</option>
        </select>


        {/* RESULT COUNT */}
        <span className="result-count">
          {visible.length} results
        </span>

      </div>

      <OrdersTable orders={visible} onEdit={onEdit} />

    </section>
  );
}

function CustomersView({ customers }) {
  return (
    <>
      <section className="kpi-grid">
        <KpiCard icon={<Users />} title="Customers" value={customers.length} trend="+5.7%" note="customers in current view" />
        <KpiCard icon={<UserPlus />} title="Repeat buyers" value={customers.filter(c => c.orders > 1).length} trend="+4.1%" note="more than one order" />
        <KpiCard icon={<CircleDollarSign />} title="Customer revenue" value={currency.format(customers.reduce((s, c) => s + c.spend, 0))} trend="+9.2%" note="completed order value" />
        <KpiCard icon={<Activity />} title="Avg. customer spend" value={currency.format(customers.length ? customers.reduce((s, c) => s + c.spend, 0) / customers.length : 0)} trend="+2.9%" note="average spend" />
      </section>
      <section className="panel customer-panel">
        <PanelHead title="Customer directory" subtitle="Customers represented in the current dataset" />
        <div className="customer-grid">
          {customers.map((customer, i) => (
            <div className="customer-card" key={customer.name}>
              <div className="customer-avatar">{customer.name.split(" ").map(x => x[0]).join("").slice(0, 2)}</div>
              <div className="customer-main"><strong>{customer.name}</strong><span>Last order {new Date(customer.last).toLocaleDateString("en-IN")}</span></div>
              <div className="customer-metric"><strong>{customer.orders}</strong><span>orders</span></div>
              <div className="customer-metric"><strong>{currency.format(customer.spend)}</strong><span>spend</span></div>
              <button className="icon-btn small-icon" title="View customer"><Eye size={15} /></button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function SettingsView({ user, settings, setSettings, onLogout, onToast }) {
  return (
    <div className="settings-grid">
      <section className="panel settings-profile">
        <div className="settings-heading"><div className="settings-big-avatar">{(user?.name || "U").slice(0, 1).toUpperCase()}</div><div><h3>{user?.name || "Analyst"}</h3><p>{user?.email || "No email available"}</p></div></div>
        <div className="setting-form">
          <label>Display name<input value={user?.name || ""} readOnly /></label>
          <label>Email address<input value={user?.email || ""} readOnly /></label>
          <button className="secondary-btn" onClick={() => onToast("Profile information is managed through your account.")}><UserCircle2 size={15} /> Account information</button>
        </div>
      </section>
      <section className="panel">
        <PanelHead title="Preferences" subtitle="Customize your dashboard experience" />
        <div className="preference-list">
          <Preference icon={settings.darkMode ? <Moon /> : <Sun />} title="Dark mode" text="Use a darker dashboard appearance" checked={settings.darkMode} onChange={v => setSettings({ ...settings, darkMode: v })} />
          <Preference icon={<Mail />} title="Email alerts" text="Receive important analytics notifications" checked={settings.emailAlerts} onChange={v => setSettings({ ...settings, emailAlerts: v })} />
        </div>
      </section>
      <section className="panel security-panel">
        <PanelHead title="Security & support" subtitle="Account tools and project information" />
        <div className="settings-links">
          <button onClick={() => onToast("Your current session is protected with JWT authentication.")}><ShieldCheck /> JWT authentication <ArrowUpRight /></button>
          <button onClick={() => onToast("MongoDB connection is handled by the backend API.")}><Database /> MongoDB database <CheckCircle2 /></button>
          <button onClick={() => onToast("Support center opened. For this internship build, use the project README.")}><HelpCircle /> Help & documentation <ArrowUpRight /></button>
          <button className="danger-link" onClick={onLogout}><LogOut /> Sign out <ArrowUpRight /></button>
        </div>
      </section>
    </div>
  );
}

function Preference({ icon, title, text, checked, onChange }) {
  return (
    <div className="preference">
      <div className="preference-icon">{icon}</div><div className="preference-copy"><strong>{title}</strong><span>{text}</span></div>
      <button className={`toggle ${checked ? "on" : ""}`} onClick={() => onChange(!checked)}><i /></button>
    </div>
  );
}

function OrdersTable({ orders = [], onEdit }) {
  if (!orders.length) return <EmptyState />;
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>ORDER</th>
            <th>CUSTOMER</th>
            <th>PRODUCT</th>
            <th>CATEGORY</th>
            <th>AMOUNT</th>
            <th>STATUS</th>
            <th>DATE</th>
            {onEdit && <th>ACTION</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.orderId}>
              <td><strong className="order-id">{order.orderId}</strong></td>
              <td>{order.customer}</td>
              <td>{order.product}</td>
              <td><span className="category-pill">{order.category}</span></td>
              <td><strong>{currency.format(order.amount)}</strong></td>
              <td><StatusBadge status={order.status} /></td>
              <td>{new Date(order.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
              {onEdit && (
                <td>
                  <button
                    className="icon-btn small-icon edit-order-btn"
                    title={`Edit ${order.orderId}`}
                    onClick={() => onEdit(order)}
                  >
                    <Pencil size={15} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KpiCard({ icon, title, value, trend, note }) {
  return <div className="kpi-card"><div className="kpi-top"><div className="kpi-icon">{icon}</div><span className="trend">{trend}</span></div><p>{title}</p><h2>{value}</h2><small>{note}</small></div>;
}

function PanelHead({ title, subtitle, actionLabel, onAction }) {
  return <div className="panel-head"><div><h3>{title}</h3><p>{subtitle}</p></div>{actionLabel ? <button className="panel-action" onClick={onAction}>{actionLabel} <ArrowUpRight size={13} /></button> : <button className="dots" onClick={() => window.dispatchEvent(new CustomEvent("insight-panel-menu"))}><MoreHorizontal size={17} /></button>}</div>;
}

function Notification({ icon, title, text }) {
  return <div className="notification-item"><div className="notification-icon">{icon}</div><div><strong>{title}</strong><span>{text}</span></div><Clock3 size={13} /></div>;
}

function StatusBadge({ status }) {
  return <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>;
}

function EmptyState() {
  return <div className="empty-state"><BarChart3 size={30} /><span>No data for this filter.</span></div>;
}

function LoadingDashboard() {
  return <div className="loading-dashboard"><div className="skeleton-row">{[1,2,3,4].map(i => <div className="skeleton-card" key={i} />)}</div><div className="skeleton-large" /></div>;
}

function EditOrderModal({
  order,
  categories,
  saving,
  onClose,
  onSave
}) {
  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  };

  const [form, setForm] = useState({
    customer: order.customer || "",
    product: order.product || "",
    category: order.category || "Technology",
    amount: order.amount ?? "",
    status: order.status || "Completed",
    date: formatDate(order.date)
  });

  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.customer.trim() ||
      !form.product.trim() ||
      !form.category ||
      form.amount === "" ||
      !form.date
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (Number(form.amount) < 0) {
      setError("Amount cannot be negative.");
      return;
    }

    await onSave({
      customer: form.customer.trim(),
      product: form.product.trim(),
      category: form.category,
      amount: Number(form.amount),
      status: form.status,
      date: form.date
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card edit-order-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} disabled={saving}>
          <X size={18} />
        </button>

        <div className="modal-icon"><Pencil /></div>
        <div className="eyebrow">EDIT ORDER</div>
        <h2>{order.orderId}</h2>
        <p className="edit-order-subtitle">Update the order information below.</p>

        <form className="edit-order-form" onSubmit={submit}>
          <div className="edit-form-grid">
            <label>
              Customer
              <input
                type="text"
                value={form.customer}
                onChange={e => updateField("customer", e.target.value)}
                placeholder="Customer name"
              />
            </label>

            <label>
              Product
              <input
                type="text"
                value={form.product}
                onChange={e => updateField("product", e.target.value)}
                placeholder="Product name"
              />
            </label>

            <label>
              Category
              <select
                value={form.category}
                onChange={e => updateField("category", e.target.value)}
              >
                {categories.length ? (
                  categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Technology">Technology</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home">Home</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Sports">Sports</option>
                  </>
                )}
              </select>
            </label>

            <label>
              Amount
              <input
                type="number"
                min="0"
                step="1"
                value={form.amount}
                onChange={e => updateField("amount", e.target.value)}
                placeholder="Amount"
              />
            </label>

            <label>
              Status
              <select
                value={form.status}
                onChange={e => updateField("status", e.target.value)}
              >
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Refunded">Refunded</option>
              </select>
            </label>

            <label>
              Date
              <input
                type="date"
                value={form.date}
                onChange={e => updateField("date", e.target.value)}
              />
            </label>
          </div>

          {error && <div className="error-box">{error}</div>}

          <div className="edit-form-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Modal({ type, onClose }) {
  const isPro = type === "pro";
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={18} /></button>
        <div className="modal-icon"><Sparkles /></div>
        <div className="eyebrow">{isPro ? "INSIGHT PRO" : "INSIGHTBOARD"}</div>
        <h2>{isPro ? "Powerful analytics, one workspace." : "Everything is connected."}</h2>
        <p>{isPro ? "Advanced segmentation, scheduled reports and deeper business intelligence can be added as the product grows." : "Your dashboard is connected to the Express API and MongoDB data layer."}</p>
        <button className="primary-btn" onClick={onClose}>Got it</button>
      </div>
    </div>
  );
}

export default App;
