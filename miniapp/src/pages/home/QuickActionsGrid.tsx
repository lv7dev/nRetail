import OutletContextCard from './OutletContextCard';

interface QuickActionsGridProps {
  onAction?: (key: string) => void;
}

export default function QuickActionsGrid({ onAction }: QuickActionsGridProps) {
  return <OutletContextCard onAction={onAction} />;
}
