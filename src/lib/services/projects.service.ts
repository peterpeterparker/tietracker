import {get, set} from 'idb-keyval';
import {v4 as uuid} from 'uuid';
import {Client} from '../models/client';
import {Project, ProjectData} from '../models/project';

export class ProjectsService {
  private static instance: ProjectsService;

  private constructor() {
    // Private constructor, singleton
  }

  static getInstance() {
    if (!ProjectsService.instance) {
      ProjectsService.instance = new ProjectsService();
    }
    return ProjectsService.instance;
  }

  async create(client: Client | undefined, data: ProjectData): Promise<Project> {
    if (!client || client === undefined) {
      throw new Error('Client not defined.');
    }

    let projects = await get<Project[]>('projects');

    if (!projects || projects.length <= 0) {
      projects = [];
    }

    data.client = {
      id: client.id as string,
      name: client.data.name,
      color: client.data.color as string,
    };

    const now = new Date().getTime();

    data.created_at = now;
    data.updated_at = now;

    const project: Project = {
      id: uuid(),
      data: data,
    };

    projects.push(project);

    await set('projects', projects);

    return project;
  }

  async list(filterActive: boolean = true): Promise<Project[]> {
    const projects = await get<Project[]>('projects');

    if (!projects || projects.length <= 0) {
      return [];
    }

    if (!filterActive) {
      return projects;
    }

    const filteredProjects: Project[] = projects.filter((project: Project) => {
      return !project.data.disabled;
    });

    if (!filteredProjects || filteredProjects.length <= 0) {
      return [];
    }

    const activeProjects = await get<string[]>('active-projects');

    const sortedProjects = filteredProjects.sort((a: Project, b: Project) => {
      const indexA: number | undefined = activeProjects?.findIndex((id: string) => a.id === id);
      const indexB: number | undefined = activeProjects?.findIndex((id: string) => b.id === id);

      if ((indexA === -1 || indexA === undefined) && (indexB === -1 || indexB === undefined)) {
        return (
          new Date(b.data.updated_at as Date | number).getTime() -
          new Date(a.data.updated_at as Date | number).getTime()
        );
      }

      if (indexB === -1 || indexB === undefined) {
        return -1;
      }

      if (indexA === -1 || indexA === undefined) {
        return 1;
      }

      return indexA - indexB;
    });

    return sortedProjects !== undefined ? sortedProjects : [];
  }

  async find(id: string | undefined): Promise<Project | undefined> {
    try {
      const projects = await get<Project[]>('projects');

      if (!projects || projects.length <= 0) {
        return undefined;
      }

      return projects.find((filteredProject: Project) => {
        return filteredProject.id === id;
      });
    } catch (_err: unknown) {
      return undefined;
    }
  }

  async listForClient(clientId: string): Promise<Project[]> {
    if (!clientId || clientId === undefined) {
      throw new Error('Client not defined.');
    }

    const projects = await get<Project[]>('projects');

    if (!projects || projects.length <= 0) {
      return [];
    }

    const filteredProjects = projects.filter((project: Project) => {
      return project.data.client !== undefined && project.data.client.id === clientId;
    });

    if (!filteredProjects || filteredProjects.length <= 0) {
      return [];
    }

    return filteredProjects;
  }

  async updateForClient(client: Client): Promise<void> {
    if (!client || !client.id) {
      throw new Error('Client not defined.');
    }

    const projects = await get<Project[]>('projects');

    if (!projects || projects.length <= 0) {
      return;
    }

    projects.forEach((project: Project) => {
      if (project.data.client && project.data.client.id === client.id) {
        project.data.client = {
          id: client.id as string,
          name: client.data.name,
          color: client.data.color as string,
        };

        project.data.updated_at = new Date().getTime();
      }
    });

    await set('projects', projects);
  }

  async update(project: Project | undefined): Promise<void> {
    if (!project || !project.data) {
      throw new Error('Project is not defined.');
    }

    const projects = await get<Project[]>('projects');

    if (!projects || projects.length <= 0) {
      throw new Error('No projects found.');
    }

    const index = projects.findIndex((filteredProject: Project) => {
      return filteredProject.id === project.id;
    });

    if (index < 0) {
      throw new Error('Project not found.');
    }

    project.data.updated_at = new Date().getTime();

    projects[index] = project;

    await set(`projects`, projects);
  }

  async updateActiveProject(project: Project | undefined): Promise<void> {
    if (!project) {
      return;
    }

    const projects = await get<string[]>('active-projects');

    if (!projects) {
      await set('active-projects', [project.id]);
      return;
    }

    await set('active-projects', [
      project.id,
      ...projects.filter((id: string) => id !== project.id),
    ]);
  }

  async deleteActiveProject(project: Project | undefined): Promise<void> {
    if (!project) {
      return;
    }

    const projects = await get<string[]>('active-projects');

    if (!projects) {
      return;
    }

    await set('active-projects', [...projects.filter((id: string) => id !== project.id)]);
  }
}
