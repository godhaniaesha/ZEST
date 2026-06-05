const express = require('express');
const router = express.Router();
const { authorizeRoles } = require('../middleware/auth');
const { STAFF_ROLES } = require('../config/roles');
const inventoryController = require('../controllers/inventoryController');

router.get('/', authorizeRoles(...STAFF_ROLES), inventoryController.getAll);
router.post('/', authorizeRoles(...STAFF_ROLES), inventoryController.create);
router.put('/:id', authorizeRoles(...STAFF_ROLES), inventoryController.update);
router.delete('/:id', authorizeRoles(...STAFF_ROLES), inventoryController.remove);

module.exports = router;
