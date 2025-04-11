import { BarChart, Upload, Folder, Users, Settings, FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };
  const stats = [
    { title: "Total Documents", value: "1,234", icon: FileText },
    { title: "Storage Used", value: "64 GB", icon: Folder },
    { title: "Active Users", value: "89", icon: Users }
  ];

  const recentUploads = [
    { name: "Constitution_1996.pdf", type: "PDF", date: "2025-04-01", size: "2.4 MB" },
    { name: "Amendments", type: "Directory", date: "2025-04-02", size: "48 KB" }
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm fixed top-0 left-0 h-full w-64 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-8">Constitutional Archive</h2>
        <ul className="space-y-4">
          <li>
            <a href="#dashboard" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg">
              <BarChart size={20} data-testid="barchart-icon" />
              Dashboard
            </a>
          </li>
          <li>
            <a href="#upload" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg">
              <Upload size={20} data-testid="upload-icon" />
              Upload
            </a>
          </li>
          <li>
            <a href="#manage" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg">
              <Folder size={20} data-testid="folder-icon" />
              Manage
            </a>
          </li>
          <li>
            <a href="#users" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg">
              <Users size={20} data-testid="users-icon" />
              Users
            </a>
          </li>
          <li>
            <a href="#settings" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg">
              <Settings size={20} data-testid="settings-icon" />
              Settings
            </a>
          </li>
        </ul>
        <button 
          onClick={handleLogout}
          className="mt-8 w-full text-left p-3 text-red-600 hover:bg-red-50 rounded-lg"
        >
          Logout
        </button>
      </nav>

      <section className="ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, Admin</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <article key={index} className="bg-white p-6 rounded-xl shadow-sm">
              <stat.icon 
                className="text-blue-600 mb-4" 
                size={24} 
                data-testid={`stat-icon-${index}`}
              />
              <h3 className="text-gray-500 text-sm mb-1">{stat.title}</h3>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </article>
          ))}
        </section>

        <section className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <header className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Uploads</h2>
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
              <Plus size={16} data-testid="plus-icon" />
              New Upload
            </button>
          </header>
          
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

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <article className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <ul className="space-y-3">
              <li>
                <button className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg">
                  <FileText size={18} data-testid="filetext-icon" />
                  Generate Report
                </button>
              </li>
              <li>
                <button className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg">
                  <Users size={18} data-testid="users-icon-quickaction" />
                  Manage Permissions
                </button>
              </li>
            </ul>
          </article>

          <article className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">System Health</h2>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-gray-600">Storage</dt>
                <dd className="font-medium">64 GB / 100 GB</dd>
              </div>
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

export default AdminDashboard;