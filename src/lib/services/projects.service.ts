import {v4 as uuid} from 'uuid';
import type {Client} from '../types/client';
import {Project, ProjectData} from '../types/project';
import {isEmptyString, isNullish} from '../utils/utils.nullish';
import {StorageServiceWithActiveProjects} from './_storage.service';

export class ProjectsService extends StorageServiceWithActiveProjects<Project[]> {
  static #instance: ProjectsService;

  private constructor() {
    super({key: 'projects'});
  }

  static getInstance() {
    if (isNullish(ProjectsService.#instance)) {
      ProjectsService.#instance = new ProjectsService();
    }
    return ProjectsService.#instance;
  }

  async create(client: Option<Client>, data: ProjectData): Promise<Project> {
    if (isNullish(client) || isNullish(client?.id)) {
      throw new Error('Client not defined.');
    }

    let projects = await this.get();

    if (isNullish(projects) || projects.length <= 0) {
      projects = [];
    }

    data.client = {
      id: client.id,
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

    await this.set(projects);

    return project;
  }

  async list(filterActive: boolean = true): Promise<Project[]> {
    const projects = await this.get();

    if (isNullish(projects) || projects.length <= 0) {
      return [];
    }

    if (!filterActive) {
      return projects;
    }

    const filteredProjects = projects.filter((project: Project) => !project.data.disabled);

    if (filteredProjects.length <= 0) {
      return [];
    }

    const activeProjects = await this.getActiveProjects();

    return filteredProjects.sort((a: Project, b: Project) => {
      const indexA = activeProjects?.findIndex((id) => a.id === id);
      const indexB = activeProjects?.findIndex((id) => b.id === id);

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
  }

  async find(id: Option<string>): Promise<Option<Project>> {
    try {
      const projects = await this.get();

      if (isNullish(projects) || projects.length <= 0) {
        return undefined;
      }

      return projects.find((filteredProject) => filteredProject.id === id);
    } catch (_err: unknown) {
      return undefined;
    }
  }

  async listForClient(clientId: string): Promise<Project[]> {
    if (isEmptyString(clientId)) {
      throw new Error('Client not defined.');
    }

    const projects = await this.get();

    if (isNullish(projects) || projects.length <= 0) {
      return [];
    }

    return projects.filter((project) => project.data.client?.id === clientId);
  }

  async updateForClient(client: Client): Promise<void> {
    if (isNullish(client) || isNullish(client.id)) {
      throw new Error('Client not defined.');
    }

    const projects = await this.get();

    if (isNullish(projects) || projects.length <= 0) {
      return;
    }

    projects.forEach((project) => {
      if (project.data.client && project.data.client.id === client.id) {
        project.data.client = {
          id: client.id,
          name: client.data.name,
          color: client.data.color as string,
        };

        project.data.updated_at = new Date().getTime();
      }
    });

    await this.set(projects);
  }

  async update(project: Option<Project>): Promise<void> {
    if (isNullish(project) || isNullish(project.data)) {
      throw new Error('Project is not defined.');
    }

    const projects = await this.get();

    if (isNullish(projects) || projects.length <= 0) {
      throw new Error('No projects found.');
    }

    const index = projects.findIndex((filteredProject) => filteredProject.id === project.id);

    if (index < 0) {
      throw new Error('Project not found.');
    }

    project.data.updated_at = new Date().getTime();

    projects[index] = project;

    await this.set(projects);
  }

  async updateActiveProject(project: Option<Project>): Promise<void> {
    if (isNullish(project)) {
      return;
    }

    const projects = await this.getActiveProjects();

    if (isNullish(projects)) {
      await this.setActiveProjects([project.id]);
      return;
    }

    await this.setActiveProjects([project.id, ...projects.filter((id) => id !== project.id)]);
  }

  async deleteActiveProject(project: Option<Project>): Promise<void> {
    if (isNullish(project)) {
      return;
    }

    const projects = await this.getActiveProjects();

    if (isNullish(projects)) {
      return;
    }

    await this.setActiveProjects([...projects.filter((id) => id !== project.id)]);
  }
}
