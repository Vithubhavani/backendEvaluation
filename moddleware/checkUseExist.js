const {User}=require('../schema/user.schema')

const checkUserExist = async (req, res, next) => {
    try {
        // Check if req.user and req.user.id are defined
        if (!req.user || !req.user.id) {
            return res.status(400).json({ message: 'User ID is missing' });
        }

        const user = await User.findById(req.user); // Retrieve user by decoded ID
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        req.user = user; // Attach user to request object
        next();
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({ message: 'Server error' });
    }
  };

  module.exports=checkUserExist