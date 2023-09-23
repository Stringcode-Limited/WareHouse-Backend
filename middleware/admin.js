const isAdmin = (req, res, next) => {
    const user = req.user;
    if (user && user.role === 'Admin') {
      next();
    } else {
      return res.status(403).json({ error: 'Access denied.' });
    }
  };
  
  export default isAdmin;
  