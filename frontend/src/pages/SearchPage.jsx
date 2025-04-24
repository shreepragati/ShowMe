// src/pages/SearchPage.jsx
import UserSearch from '../components/UserSearch';

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-2xl mx-auto bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-800">
        <h2 className="text-2xl font-semibold mb-6">🔍 Search Users</h2>
        <UserSearch />
      </div>
    </div>
  );
}
