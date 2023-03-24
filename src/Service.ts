import { User } from './User';
import { Project } from './Project';
import { Job } from './Job';
import { Application } from './Application';
import { InputFile } from './InputFile';
import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import FormData from 'form-data';
import { Buffer } from 'buffer';

export class Service {
  private _api_key: string;
  private _job_channel_auth: any;
  private _job_channel_name: string;
  private _job_channel: any;
  private _connected: boolean;
  private _wshost: string;
  private _channel_auth: string;
  private _scheme: string;
  private _headers: { [key: string]: string };
  private _basename: string;
  private _api_user: string;
  private _api_projects: string;
  private _api_applications: string;
  private _api_projects_createjob: string;
  private _api_projects_getjobs: string;
  private _api_projects_files: string;
  private _api_update: string;
  private _api_projects_upload: string;
  private _api_projects_assignfile: string;
  private _api_projects_outputfiles: string;
  private _api_projects_download: string;
  private _projects: any[];
  private _jobs: any[];
  private _applications: any[];
  private _inputfiles: any[];
  private _outputfiles: any[];
  private _selected_project: Project | null;
  private _selected_application: any;
  private _selected_job: Job | null;
  private _pusher: Pusher;
  private _echo: Echo;
  private _user: User | null;
  constructor(api_key: string, TLS = true) {
    this._user = null;
    this._api_key = api_key;
    this._job_channel_auth = null;
    this._job_channel_name = 'jobs.';
    this._job_channel = null;
    this._connected = false;
    this._wshost = 'socket.elytica.com';
    this._channel_auth = "service.elytica.com";
    this._scheme = 'https://';
    this._headers = { 'Authorization': `Bearer ${api_key}` };
    this._pusher = new Pusher('elytica_service', {
      httpHost: `${this._channel_auth}`,
      wsHost: `${this._wshost}`,
      wsPath: '/app',
      enabledTransports: ['ws', 'wss'],
      channelAuthorization: {
        endpoint: `${this._scheme}${this._channel_auth}/broadcasting/auth`,
        transport: 'ajax'
      },
      auth: {
        headers: this._headers 
      }
    });
    this._echo = new Echo({
      key: 'elytica_service',
      host: `${this._scheme}${this._channel_auth}`,
      wsHost: `${this._wshost}`,
      disableStats: true,
      encrypted: true,
      auth: {
        headers: this._headers 
      },
      broadcaster: 'pusher',
      authEndpoint: '/broadcasting/auth',
      client: this._pusher 
    }); 

    this._basename = 'service.elytica.com/api';
    this._api_user = '/user';
    this._api_projects = "/projects";
    this._api_applications = "/applications";
    this._api_projects_createjob = "/projects/{project}/createjob";
    this._api_projects_getjobs = "/projects/{project}/getjobs";
    this._api_projects_files = "/projects/{project}/files";
    this._api_update = "/update/{job}";
    this._api_projects_upload = "/projects/{project}/upload";
    this._api_projects_assignfile = "/projects/{project}/assignfile/{job}";
    this._api_projects_outputfiles = "/projects/{project}/outputfiles/{job}";
    this._api_projects_download = "/projects/{project}/download/{file}";
    // Initialize lists
    this._projects = [];
    this._jobs = [];
    this._applications = [];
    this._inputfiles = [];
    this._outputfiles = [];
    this._selected_project = null;
    this._selected_application = null;
    this._selected_job = null;
  }

  disconnect() {
    this._echo.disconnect();
  }

  async login(api_key: string = this._api_key): Promise<void> {
    this._api_key = api_key;
    this._headers = { 'Authorization': `Bearer ${api_key}` };
    try {
      const response = await axios.get(`${this._scheme}${this._basename}${this._api_user}`, { headers: this._headers });
      this._user = new User(response.data);
    } catch (error: any) {
      throw new Error(error.response.data);
    }
  }
  async createProject(name: string, description: string, application: Application): Promise<Project[]> {
    try {
      const response = await axios.post(
        `${this._scheme}${this._basename}${this._api_projects}`, 
        { name, description, application: application.id },
        { headers: this._headers }
      );
  
      if (typeof response.data === 'object') {
        const project = new Project(response.data);
        this._projects.push(project);
        this._selected_project = project;
        await this.createJob('Initial Job');
      } else {
        throw new Error('Invalid Project data.');
      }
      return this._projects;
    } catch (error : any) {
      throw new Error(error.response.data);
    }
  }
  async getProjects(): Promise<Project[]> {
    try {
      const response = await axios.get(
        `${this._scheme}${this._basename}${this._api_projects}`, 
        { headers: this._headers }
      );
      this._projects = [];
      if (Array.isArray(response.data)) {
        for (const data of response.data) {
          this._projects.push(new Project(data));
        }
      } else {
        throw new Error('Invalid Project data.');
      }
      return this._projects;
    } catch (error: any) {
      throw new Error(error.response.data);
    }
  }

  async createJob(name: string, priority = 100): Promise<Job> {
    if (!this._selected_project) {
      throw new Error("No Project selected.");
    }
    try {
      const response = await axios.post(
        `${this._scheme}${this._basename}${this._api_projects_createjob.replace("{project}", this._selected_project.id.toString())}`,
        {
          name,
          priority,
        },
        {
          headers: this._headers,
        }
      );
      const newJob = new Job(response.data);
      this._jobs.push(newJob);
      this._selected_job = newJob;
      return newJob;
    } catch (error: any) {
      throw new Error(error.response.data);
    }
  }

  async getJobs(project: Project | null = this._selected_project): Promise<Job[]> {
    if (!project) {
      throw new Error("No project selected.");
    }
    try {
      const response = await axios.get(
        `${this._scheme}${this._basename}${this._api_projects_getjobs.replace("{project}", project.id.toString())}`,
        {
          headers: this._headers,
        }
      );
      const jobs = response.data.map((job: any) => new Job(job));
      this._jobs = jobs;
      return jobs;
    } catch (error: any) {
      throw new Error(error.response.data);
    }
  }
  async selectProjectByName(name: string): Promise<Project | null> {
    this._jobs = [];
    this._inputfiles = [];
  
    if (this._projects.length === 0) {
      await this.getProjects();
    }
  
    for (const project of this._projects) {
      if (name === project.name) {
        this._selected_project = project;
        return project;
      }
    }
    return null;
  }

  async uploadFileContents(project: Project | null = this._selected_project, filename: string, contents: string, encoding: BufferEncoding = 'utf8'): Promise<any> {
    if (!project) {
      throw new Error("No project selected.");
    }
    try {
      const url = `${this._scheme}${this._basename}${this._api_projects_upload}`
        .replace("{project}", project.id.toString());
      let formData = new FormData();
      const buffer = Buffer.from(contents, encoding); 
      formData.append("files[]", buffer, filename);
      const response = await axios.post(url, formData, {
        headers: {
          ...this._headers,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error);
    }
  }
  
  async assignFile(inputfile: InputFile, argument: number, job: Job | null = this._selected_job): Promise<any> {
    if (!job) {
      throw new Error("No job selected");
    }
    if (!this._selected_project) {
      throw new Error("No project selected");
    }
    try {
      const data = {
        arg: argument,
        file: inputfile.id
      };
      const response = await axios.post(
        `${this._scheme}${this._basename}${this._api_projects_assignfile.replace("{project}", this._selected_project.id.toString()).replace("{job}", job.id.toString())}`,
        data,
        { headers: this._headers }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response.data);
    }
  }
  async getApplications(): Promise<Application[]> {
    try {
      const response = await axios.get(
        `${this._scheme}${this._basename}${this._api_applications}`,
        {
          headers: this._headers,
        }
      );
      this._applications = response.data.map((app: any) => new Application(app));
      return this._applications;
    } catch (error: any) {
      throw new Error(error.response.data);
    }
  }
  
  async selectApplicationByName(name: string): Promise<Application> {
    if (this._applications.length === 0) {
      await this.getApplications();
    }
    const app = this._applications.find((app: Application) => app.display_name === name);
    if (!app) {
      throw new Error(`Application with name ${name} not found`);
    }
    this._selected_application = app;
    return app;
  }


  async selectJobByName(name: string): Promise<Job|null> {
    if (this._selected_project === null) {
      throw new Error('No project selected');
    }
    if (this._jobs.length === 0) {
      await this.getJobs();
    }
    const job = this._jobs.find((j) => j.name === name);
    if (!job) {
      throw new Error(`Job with name ${name} not found`);
    }
    if (job.project_id !== this._selected_project.id) {
      throw new Error('Job does not belong to the selected project');
    }
    this._selected_job = job;
    this._job_channel = this._echo.join(`jobs.${job.id}`);
    return job;
  }

  async queueJob(finished_callback: Function | null, stdout_callback: Function | null): Promise<Job> {
    try {
      if (!this._selected_job) {
        throw new Error("No job selected.");
      }
      if (finished_callback) {
        this._job_channel = this._job_channel.listen('client-finished', finished_callback); 
      }
      if (stdout_callback) {
        this._job_channel = this._job_channel.listen('client-stdout', stdout_callback); 
      }
      const response = await axios.put(
        `${this._scheme}${this._basename}${this._api_update.replace("{job}", `${this._selected_job.id.toString()}`)}`,
        { updatedstatus: 1 },
        { headers: this._headers }
      );
      const responseData = response.data;
      if (typeof responseData === 'object') {
        this._selected_job = new Job(responseData);
        for (let i = 0; i < this._jobs.length; i++) {
          if (this._jobs[i].id === this._selected_job.id) {
            this._jobs[i] = this._selected_job;
          }
        }
      } else {
        throw new Error('Invalid Job data.');
      }
      return this._selected_job;
    } catch (error: any) {
      throw new Error(error);
    }
  }
  async deleteProject(project: Project | null): Promise<void> {
    if (!project) {
      throw new Error("No project selected");
    }
    try {
      const response = await axios.delete(
        `${this._scheme}${this._basename}${this._api_projects}/${project.id}`, 
        { headers: this._headers }
      );
      this._projects = this._projects.filter((p) => p.id !== project.id);
    } catch (error: any) {
      throw new Error(error.response.data);
    }
  }
}

