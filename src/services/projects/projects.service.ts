import { get, set } from 'idb-keyval';

import uuid from 'uuid/v4';

import isAfter from 'date-fns/isAfter';

import { Project, ProjectData } from '../../models/project';

import { toDateObj } from '../../utils/utils.date';
import { Client } from '../../models/client';

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

    create(client: Client, data: ProjectData): Promise<Project> {
        return new Promise<Project>(async (resolve, reject) => {
            try {
                let projects: Project[] = await get('projects');
    
                if (!projects || projects.length <= 0) {
                    projects = [];
                }
            
                data.client = {
                    id: client.id as string,
                    name: client.data.name,
                    color: client.data.color as string
                };

                const now: number = new Date().getTime();

                data.created_at = now;
                data.updated_at = now;

                const project: Project = {
                    id: uuid(),
                    data: data
                }

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

                if (!filterActive) {
                    resolve(projects);
                    return;
                }

                const filteredProjects: Project[] = projects.filter((project: Project) => {
                    const from: Date | undefined = toDateObj(project.data.from);
                    const to: Date | undefined = toDateObj(project.data.to);

                    if (!to || to === undefined) {
                        return true;
                    }

                    return isAfter(to, from ? from : new Date());
                });

                if (!filteredProjects || filteredProjects.length <= 0) {
                    resolve([]);
                    return;
                }

                const sortedProjects: Project[] = filteredProjects.sort((a: Project, b: Project) => {
                    return new Date(b.data.updated_at as Date | number).getTime() - new Date(a.data.updated_at as Date | number).getTime();
                });

                resolve(sortedProjects);
            } catch (err) {
                reject(err);
            }
        });
    }
}
