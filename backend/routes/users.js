const express = require('express');
const router = express.Router();
const { authorizeRoles } = require('../middleware/auth');
const { ADMIN_ROLES } = require('../config/roles');
const usersController = require('../controllers/usersController');

router.get('/', authorizeRoles(...ADMIN_ROLES), usersController.getAll);
router.post('/', authorizeRoles(...ADMIN_ROLES), usersController.create);
router.put('/:id', authorizeRoles(...ADMIN_ROLES), usersController.update);
router.delete('/:id', authorizeRoles(...ADMIN_ROLES), usersController.remove);

module.exports = router;
