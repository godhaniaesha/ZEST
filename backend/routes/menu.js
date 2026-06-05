const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { auth, authorizeRoles } = require('../middleware/auth');
const { STAFF_ROLES } = require('../config/roles');
const menuController = require('../controllers/menuController');

const staffOnly = [auth, authorizeRoles(...STAFF_ROLES)];

// Categories & cuisines (must be before /:id)
router.get('/categories', menuController.getCategories);
router.post('/categories', ...staffOnly, upload.single('img'), menuController.createCategory);
router.put('/categories/:id', ...staffOnly, upload.single('img'), menuController.updateCategory);
router.delete('/categories/:id', ...staffOnly, menuController.removeCategory);

router.get('/cuisines', menuController.getCuisines);
router.post('/cuisines', ...staffOnly, upload.single('img'), menuController.createCuisine);
router.put('/cuisines/:id', ...staffOnly, upload.single('img'), menuController.updateCuisine);
router.delete('/cuisines/:id', ...staffOnly, menuController.removeCuisine);

// Menu items
router.get('/', menuController.getAll);
router.get('/:id', menuController.getById);

router.post('/', ...staffOnly, upload.single('img'), menuController.create);
router.put('/:id', ...staffOnly, upload.single('img'), menuController.update);
router.delete('/:id', ...staffOnly, menuController.remove);

module.exports = router;
