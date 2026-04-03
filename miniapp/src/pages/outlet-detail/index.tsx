import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppHeader, TabBar } from '@/components/ui';
import OutletAvatar from './OutletAvatar';
import OutletActionButtons from './OutletActionButtons';
import ContactTab from './ContactTab';
import GeneralInfoTab from './GeneralInfoTab';
import SegmentationTab from './SegmentationTab';

const PLACEHOLDER_OWNER = {
  name: 'Nguyen Van A',
  phone: '0901234567',
  lastUpdated: '15/01/2024',
  isActive: true,
};

const PLACEHOLDER_CONTACT = {
  name: 'Tran Thi B',
  phone: '0987654321',
  lastUpdated: '01/03/2024',
  isActive: true,
};

export default function OutletDetailPage() {
  const { t } = useTranslation('outlet-detail');
  const navigate = useNavigate();

  const tabs = [
    { key: 'generalInfo', label: t('tabs.generalInfo') },
    { key: 'contact', label: t('tabs.contact') },
    { key: 'segmentation', label: t('tabs.segmentation') },
  ];

  const [activeTab, setActiveTab] = useState('contact');

  return (
    <div>
      <AppHeader title={t('header.title')} onBack={() => navigate(-1)} />

      <div className="bg-surface dark:bg-surface-dark py-6">
        <OutletAvatar name="Quán Đại An" subtitle={t('subtitle')} />
      </div>

      <OutletActionButtons className="py-4" />

      <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'generalInfo' && <GeneralInfoTab />}
      {activeTab === 'contact' && (
        <ContactTab owner={PLACEHOLDER_OWNER} contactPerson={PLACEHOLDER_CONTACT} />
      )}
      {activeTab === 'segmentation' && <SegmentationTab />}
    </div>
  );
}
