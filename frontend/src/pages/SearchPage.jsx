// src/pages/SearchPage.jsx
import { useState } from 'react';
import UserSearch from '../components/UserSearch';

export default function SearchPage() {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Search Users</h2>
      <UserSearch />
    </div>
  );
}
