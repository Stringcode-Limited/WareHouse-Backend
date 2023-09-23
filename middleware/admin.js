import UserModel from './../models/user.model.js';

export const isAdmin = (req, res, next) => {
  if (!req.userAuth) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const userId = req.userAuth;
  UserModel.findById(userId)
    .then((user) => {
      if (user && user.role === 'Admin') {
        next();
      } else {
        return res.status(403).json({ message: 'Access denied' });
      }
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    });
};
