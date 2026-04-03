import { useTranslation } from 'react-i18next';
import PersonCard from './PersonCard';

interface PersonData {
  name: string;
  phone: string;
  lastUpdated: string;
  isActive?: boolean;
}

interface ContactTabProps {
  owner: PersonData;
  contactPerson: PersonData;
}

export default function ContactTab({ owner, contactPerson }: ContactTabProps) {
  const { t } = useTranslation('outlet-detail');

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-content dark:text-content-dark">
          {t('contact.outletOwner')}
        </p>
        <PersonCard
          name={owner.name}
          phone={owner.phone}
          lastUpdated={owner.lastUpdated}
          isActive={owner.isActive}
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-content dark:text-content-dark">
          {t('contact.contactPerson')}
        </p>
        <PersonCard
          name={contactPerson.name}
          phone={contactPerson.phone}
          lastUpdated={contactPerson.lastUpdated}
          isActive={contactPerson.isActive}
        />
      </div>
    </div>
  );
}
