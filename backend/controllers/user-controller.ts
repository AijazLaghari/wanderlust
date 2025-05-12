import User from '../models/user.js';
import { HTTP_STATUS, RESPONSE_MESSAGES } from '../utils/constants.js';
import { Role } from '../types/role-type.js';

// Using any types to resolve type issues
type Request = any;
type Response = any;
type NextFunction = any;

export const getAllUserHandler = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.status(HTTP_STATUS.OK).json(users);
  } catch (err: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};

export const changeUserRoleHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!userId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'User ID is required' });
    }
    
    if (!role || (role !== Role.Admin && role !== Role.User)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Valid role is required' });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: RESPONSE_MESSAGES.USERS.USER_NOT_EXISTS });
    }
    
    res.status(HTTP_STATUS.OK).json(user);
  } catch (err: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};

export const deleteUserHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'User ID is required' });
    }
    
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: RESPONSE_MESSAGES.USERS.USER_NOT_EXISTS });
    }
    
    res.status(HTTP_STATUS.OK).json({ message: 'User deleted successfully' });
  } catch (err: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};
