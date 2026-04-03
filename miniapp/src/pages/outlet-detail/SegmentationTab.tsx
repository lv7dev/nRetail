import { useTranslation } from 'react-i18next';

export default function SegmentationTab() {
  const { t } = useTranslation('outlet-detail');

  return (
    <div className="flex items-center justify-center p-8">
      <p className="text-sm text-content-muted dark:text-content-dark-muted">
        {t('stubs.segmentation')}
      </p>
    </div>
  );
}
