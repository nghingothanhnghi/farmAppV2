// src/components/Migration/MigrationPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import TemplateSelector from "./components/TemplateSelector";
import PageTitle from '../common/PageTitle';
import Button from "../common/Button";
import { getAllTemplates } from "../../services/templateService";
import type { Template } from "../../models/types/Template";

const MigrationPage = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    getAllTemplates()
      .then((all) => setTemplates(all))
      .catch((err) => console.error("Failed to fetch templates:", err));
  }, []);

  return (
    <div>
      <PageTitle
        title="Data Migration"
        actions={
          <Button
            label="Add Transform Data"
            onClick={() => navigate('/add-transform-data')}
            variant="secondary"
            rounded='lg'
          />
        }
      />
      <TemplateSelector templates={templates} />
    </div>
  );
};

export default MigrationPage;
