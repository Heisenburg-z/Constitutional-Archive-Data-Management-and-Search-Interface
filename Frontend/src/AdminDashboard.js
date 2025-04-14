// Import necessary icons from Lucide React library and navigation hook from react-router-dom
import { BarChart, Upload, Folder, Users, Settings, FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Main component for the Admin Dashboard
const AdminDashboard = () => {
  const navigate = useNavigate();

  // Logout handler: removes token from local storage and redirects to homepage
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  // Dummy statistics data displayed at the top
  const stats = [
    { title: "Total Documents", value: "1,234", icon: FileText },
    { title: "Storage Used", value: "64 GB", icon: Folder },
    { title: "Active Users", value: "89", icon: Users }
  ];

  // Dummy list of recent uploads shown in a table
  const recentUploads = [
    { name: "Constitution_1996.pdf", type: "PDF", date: "2025-04-01", size: "2.4 MB" },
    { name: "Amendments", type: "Directory", date: "2025-04-02", size: "48 KB" }
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Sidebar navigation */}
      <nav className="bg-white shadow-sm fixed top-0 left-0 h-full w-64 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-8">Constitutional Archive</h2>
        <ul className="space-y-4">
          {/* Dashboard link */}
          <li>
            <a href="#dashboard" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg">
              <BarChart size={20} />
              Dashboard
            </a>
          </li>
          {/* Upload page link */}
          <li>
            <a href="#upload" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg">
              <Upload size={20} />
              Upload
            </a>
          </li>
          {/* Manage files or folders */}
          <li>
            <a href="#manage" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg">
              <Folder size={20} />
              Manage
            </a>
          </li>
          {/* Users management */}
          <li>
            <a href="#users" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg">
              <Users size={20} />
              Users
            </a>
          </li>
          {/* Settings page */}
          <li>
            <a href="#settings" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg">
              <Settings size={20} />
              Settings
            </a>
          </li>
        </ul>

        {/* Logout button */}
        <button 
          onClick={handleLogout}
          className="mt-8 w-full text-left p-3 text-red-600 hover:bg-red-50 rounded-lg"
        >
          Logout
        </button>
      </nav>

      {/* Main content shifted right of the sidebar */}
      <section className="ml-64 p-8">
        {/* Page header */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, Admin</p>
        </header>

        {/* Statistics cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <article key={index} className="bg-white p-6 rounded-xl shadow-sm">
              {/* Icon for the stat */}
              <stat.icon className="text-blue-600 mb-4" size={24} />
              {/* Title of the stat */}
              <h3 className="text-gray-500 text-sm mb-1">{stat.title}</h3>
              {/* Value of the stat */}
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </article>
          ))}
        </section>

        {/* Recent uploads section */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <header className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Uploads</h2>
            {/* New upload button */}
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
              <Plus size={16} />
              New Upload
            </button>
          </header>

          {/* Table showing uploaded files */}
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Name</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Size</th>
              </tr>
            </thead>
            <tbody>
              {recentUploads.map((upload, index) => (
                <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="py-4">{upload.name}</td>
                  <td className="py-4">{upload.type}</td>
                  <td className="py-4">{upload.date}</td>
                  <td className="py-4">{upload.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Two-column layout for quick actions and system health */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick actions panel */}
          <article className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <ul className="space-y-3">
              {/* Generate report action */}
              <li>
                <button className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg">
                  <FileText size={18} />
                  Generate Report
                </button>
              </li>
              {/* Manage permissions action */}
              <li>
                <button className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg">
                  <Users size={18} />
                  Manage Permissions
                </button>
              </li>
            </ul>
          </article>

          {/* System health panel */}
          <article className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">System Health</h2>
            <dl className="space-y-4">
              {/* Storage usage */}
              <div className="flex justify-between">
                <dt className="text-gray-600">Storage</dt>
                <dd className="font-medium">64 GB / 100 GB</dd>
              </div>
              {/* Active sessions */}
              <div className="flex justify-between">
                <dt className="text-gray-600">Active Sessions</dt>
                <dd className="font-medium">12</dd>
              </div>
            </dl>
          </article>
        </section>
      </section>
    </main>
  );
};

// Exporting the component for use in other parts of the app
export default AdminDashboard;
