import React from "react";
import { SettingsDialog } from "../../components/SettingsDialog";

const SettingsPage: React.FC = () => {
  return (
    <div className="flex h-full items-center justify-center p-4">
      <SettingsDialog />
    </div>
  );
};

export default SettingsPage;
