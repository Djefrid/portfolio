"use client";

import { useState } from 'react';
import { useAuthContext } from '@/lib/firebase';
import AdminHeader from '@/components/admin/AdminHeader';
import ProfileEditor from '@/components/admin/ProfileEditor';
import ProjectsEditor from '@/components/admin/ProjectsEditor';
import SkillsEditor from '@/components/admin/SkillsEditor';

type Tab = 'profile' | 'projects' | 'skills';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { user } = useAuthContext();

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profil & À propos' },
    { id: 'projects', label: 'Projets' },
    { id: 'skills', label: 'Compétences' },
  ];

  return (
    <div className="min-h-screen bg-dark-950">
      <AdminHeader />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">
            Connecté en tant que {user?.email}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-dark-800 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
          {activeTab === 'profile' && <ProfileEditor />}
          {activeTab === 'projects' && <ProjectsEditor />}
          {activeTab === 'skills' && <SkillsEditor />}
        </div>
      </main>
    </div>
  );
}
