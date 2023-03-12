import { TasksService } from './tasks.service';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaskStatus } from './task-status.enum';
import { Users } from 'src/auth/users.entity';

const mockUser = {
  username: 'Test',
  id: 'someId',
  password: 'strongpwd',
  tasks: [],
};

const mockFilterDto = {
  status: TaskStatus.DONE,
  search: 'test',
};

const mockTask = {
  id: 'test-task-id',
  title: 'Test task',
  description: 'This is a test task',
  status: TaskStatus.OPEN,
} as Task;

describe('TasksService', () => {
  let tasksService: TasksService;
  let tasksRepository;
  Repository<Task>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
            save: jest.fn()
          },
        },
      ],
    }).compile();

    tasksService = moduleRef.get<TasksService>(TasksService);
    tasksRepository = moduleRef.get<Repository<Task>>(getRepositoryToken(Task));
  });

  describe('getTasks', () => {
    it('gets all tasks from the repository', async () => {
      const mockTasks = [{}, {}];
      const mockFilterDto = { status: TaskStatus.IN_PROGRESS, search: 'Test' };
      const createQueryBuilder = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockTasks),
      });
      tasksRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(createQueryBuilder());

      const result = await tasksService.getTasks(mockFilterDto, mockUser);

      expect(tasksRepository.createQueryBuilder).toHaveBeenCalled();
      expect(createQueryBuilder().where).toHaveBeenCalledWith({
        user: mockUser,
      });
      expect(createQueryBuilder().andWhere).toHaveBeenCalledWith(
        'task.status = :status',
        { status: 'OPEN' },
      );
      expect(createQueryBuilder().andWhere).toHaveBeenCalledWith(
        '(LOWER(task.title) LIKE :search OR LOWER(task.description) LIKE LOWER(:search))',
        { search: '%Test%' },
      );
      expect(createQueryBuilder().getMany).toHaveBeenCalled();
      expect(result).toEqual(mockTasks);
    });
  });

  describe('getTaskById', () => {
    it('gets tasks by id from the repository', async () => {
      tasksRepository.findOne.mockResolvedValue(mockTask);
      const result = await tasksService.getTaskById(mockTask.id, mockUser);
      expect(result).toEqual(mockTask);
    });
  });

  describe('deleteTaskById', () => {
    it('delete task by id', async () => {
        const deleteResult = { affected: 1 };
        jest.spyOn(tasksRepository, 'delete').mockResolvedValue(deleteResult);
  
        const id = '123';
        const user = { id: '456' } as Users;
  
        await expect(tasksService.deleteTaskById(id, user)).resolves.toBeUndefined();
        expect(tasksRepository.delete).toHaveBeenCalledWith({ id, user });  
    });

    describe('updateTaskById', () => {
      it('update task by id', async () => {
        jest.spyOn(tasksRepository, 'save').mockResolvedValue(mockTask)
        jest.spyOn(tasksService, 'getTaskById').mockResolvedValue(mockTask)
        const newMockTask = {
          id: 'test-task-id',
          title: 'Test task',
          description: 'This is a test task',
          status: TaskStatus.IN_PROGRESS,
        } as Task;

        await expect(tasksService.updateTaskById(mockTask.id, mockTask.status, mockUser)).toBeCalled;
        const result = await tasksService.updateTaskById(newMockTask.id, newMockTask.status, mockUser)
        expect(result).toEqual(newMockTask)
      })
    })
  });
});
