import {get, set} from 'idb-keyval';

import {v4 as uuid} from 'uuid';

import {Project, ProjectData} from '../../models/project';
import {Client} from '../../models/client';

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

  create(client: Client | undefined, data: ProjectData): Promise<Project> {
    return new Promise<Project>(async (resolve, reject) => {
      try {
        if (!client || client === undefined) {
          reject('Client not defined.');
          return;
        }

        let projects: Project[] = await get('projects');

        if (!projects || projects.length <= 0) {
          projects = [];
        }

        data.client = {
          id: client.id as string,
          name: client.data.name,
          color: client.data.color as string,
        };

        const now: number = new Date().getTime();

        data.created_at = now;
        data.updated_at = now;

        const project: Project = {
          id: uuid(),
          data: data,
        };

        projects.push(project);

        await set('projects', projects);

        resolve(project);
      } catch (err) {
        reject(err);
      }
    });
  }

  list(filterActive: boolean = true): Promise<Project[]> {
    return new Promise<Project[]>(async (resolve, reject) => {
      try {
        const projects: Project[] = await get('projects');

        if (!projects || projects.length <= 0) {
          resolve([]);
          return;
        }

        if (!filterActive) {
          resolve(projects);
          return;
        }

        const filteredProjects: Project[] = projects.filter((project: Project) => {
          return !project.data.disabled;
        });

        if (!filteredProjects || filteredProjects.length <= 0) {
          resolve([]);
          return;
        }

        const sortedProjects: Project[] = filteredProjects.sort((a: Project, b: Project) => {
          return new Date(b.data.updated_at as Date | number).getTime() - new Date(a.data.updated_at as Date | number).getTime();
        });

        resolve(sortedProjects !== undefined ? sortedProjects : []);
      } catch (err) {
        reject(err);
      }
    });
  }

  find(id: string | undefined): Promise<Project | undefined> {
    return new Promise<Project | undefined>(async (resolve) => {
      try {
        const projects: Project[] = await get('projects');

        if (!projects || projects.length <= 0) {
          resolve(undefined);
          return;
        }

        const project: Project | undefined = projects.find((filteredProject: Project) => {
          return filteredProject.id === id;
        });

        resolve(project);
      } catch (err) {
        resolve(undefined);
      }
    });
  }

  listForClient(clientId: string): Promise<Project[]> {
    return new Promise<Project[]>(async (resolve, reject) => {
      try {
        if (!clientId || clientId === undefined) {
          reject('Client not defined.');
          return;
        }

        const projects: Project[] = await get('projects');

        if (!projects || projects.length <= 0) {
          resolve([]);
          return;
        }

        const filteredProjects: Project[] = projects.filter((project: Project) => {
          return project.data.client !== undefined && project.data.client.id === clientId;
        });

        if (!filteredProjects || filteredProjects.length <= 0) {
          resolve([]);
          return;
        }

        resolve(filteredProjects);
      } catch (err) {
        reject(err);
      }
    });
  }

  updateForClient(client: Client): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        if (!client || !client.id) {
          reject('Client not defined.');
          return;
        }

        const projects: Project[] = await get('projects');

        if (!projects || projects.length <= 0) {
          resolve();
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

        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  update(project: Project | undefined): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        if (!project || !project.data) {
          reject('Project is not defined.');
          return;
        }

        const projects: Project[] = await get('projects');

        if (!projects || projects.length <= 0) {
          reject('No projects found.');
          return;
        }

        const index: number = projects.findIndex((filteredProject: Project) => {
          return filteredProject.id === project.id;
        });

        if (index < 0) {
          reject('Project not found.');
          return;
        }

        project.data.updated_at = new Date().getTime();

        projects[index] = project;

        await set(`projects`, projects);

        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }
}
