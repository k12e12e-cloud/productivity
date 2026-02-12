"use client";

import { useProjects } from "@/hooks/use-projects";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProjectFilterProps {
  selectedProjectId: string;
  onChangeProjectId: (id: string) => void;
}

export function ProjectFilter({ selectedProjectId, onChangeProjectId }: ProjectFilterProps) {
  const { projects } = useProjects();

  if (projects.length === 0) return null;

  return (
    <Select
      value={selectedProjectId || "_all"}
      onValueChange={(v) => onChangeProjectId(v === "_all" ? "" : v)}
    >
      <SelectTrigger className="w-40 h-7 text-xs">
        <SelectValue placeholder="프로젝트" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="_all">전체 프로젝트</SelectItem>
        {projects.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
