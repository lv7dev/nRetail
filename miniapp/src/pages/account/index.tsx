import { useTranslation } from 'react-i18next';
import { MenuListItem } from '@/components/ui';
import { useOutletStore } from '@/store/useOutletStore';
import { useAuthStore } from '@/store/useAuthStore';
import AccountProfileHeader from './AccountProfileHeader';

export default function AccountPage() {
  const { t } = useTranslation('account');
  const selectedOutlet = useOutletStore((s) => s.selectedOutlet);
  const user = useAuthStore((s) => s.user);

  const menuItems = [
    { key: 'viewProfile', icon: 'user', label: t('menu.viewProfile') },
    { key: 'changePassword', icon: 'lock', label: t('menu.changePassword') },
    { key: 'settings', icon: 'gear', label: t('menu.settings') },
    { key: 'manual', icon: 'book', label: t('menu.manual') },
    { key: 'assistant', icon: 'robot', label: t('menu.assistant') },
    { key: 'feedback', icon: 'comment', label: t('menu.feedback') },
  ];

  return (
    <div>
      <AccountProfileHeader
        outletName={selectedOutlet?.name ?? t('profile.defaultName')}
        phone={user?.phone ?? ''}
      />

      <div className="mt-2">
        {menuItems.map((item) => (
          <MenuListItem key={item.key} icon={item.icon} label={item.label} onClick={() => {}} />
        ))}

        <MenuListItem
          icon="right-from-bracket"
          label={t('menu.logout')}
          onClick={() => {}}
          variant="destructive"
        />
      </div>
    </div>
  );
}
