import { Service } from '../src/Service';
IMPORT { User } from '../src/User';

const application_name =
  "MIP Interpreter with Python and HiGHS";
const test_project_name = "UnitTestProject";
const config = require('./secrets.json');
console.error = jest.fn();
let elytica = new Service(config.key);

afterAll(async () => {
  await new Promise<void>((resolve) => {
    elytica.disconnect();
    setTimeout(() => {
      resolve();
    }, 1000);
  });
});

test('Log into elytica.', async () => {
  try {
    await elytica.login();
  } catch (error) {
    console.error(error);
  }
  expect(console.error).not.toHaveBeenCalled();
});

test('Create project on elytica.', async () => {
  try {
    const projects = await elytica.getProjects();
    const application = await elytica.selectApplicationByName(application_name);
    await elytica.createProject(test_project_name, "?", application);
  } catch (error) {
    console.error(error);
  }
  expect(console.error).not.toHaveBeenCalled();
});

test('Get elytica project jobs.', async () => {
  try {
    const project = await elytica.selectProjectByName(test_project_name);
    const jobs = await elytica.getJobs(project);
  } catch (error) {
    console.error(error);
  }
  expect(console.error).not.toHaveBeenCalled();
});

test('Upload model to project and assign file.', async () => {
  try {
    const project = await elytica.selectProjectByName(
      test_project_name);
    const job = await elytica.selectJobByName("Initial Job");
    if (!job) {
      throw new Error("Invalid job");
    }
    const file = await elytica.uploadFileContents(project,
      `${job.id}.hlpl`, config.model);
    await elytica.assignFile(file.newfiles[0], 1);
  } catch (error) {
    console.error(error);
  }
  expect(console.error).not.toHaveBeenCalled();
});

test('Queue current elytica job.', async () => {
  await elytica.login();
  try {
    await elytica.selectJobByName("Initial Job");
    await elytica.queueJob((data: any)=>{
    }, (data: any)=> {
    });
  } catch (error: any) {
    console.error(error);
  }
  await new Promise((resolve) => setTimeout(resolve, 1000));
  expect(console.error).not.toHaveBeenCalled();
});

test('Select and delete elytica project.', async () => {
  try {
    const project = await elytica.selectProjectByName(test_project_name);
    await elytica.deleteProject(project);
  } catch (error: any) {
    console.error(error);
  }
  expect(console.error).not.toHaveBeenCalled();
});




