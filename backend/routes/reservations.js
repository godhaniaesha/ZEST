const express = require('express');
const router = express.Router();
const { auth, authorizeRoles } = require('../middleware/auth');
const { STAFF_ROLES } = require('../config/roles');
const reservationController = require('../controllers/reservationController');

router.post('/public', reservationController.createPublic);
router.get('/my', auth, reservationController.getMyReservations);
router.put('/my/:id/cancel', auth, reservationController.cancelMyReservation);

router.get(
  '/confirmed',
  auth,
  authorizeRoles(...STAFF_ROLES),
  reservationController.getConfirmedForOrders
);
router.get('/', auth, authorizeRoles(...STAFF_ROLES), reservationController.getAll);
router.post('/', auth, authorizeRoles(...STAFF_ROLES), reservationController.create);
router.patch('/:id/status', auth, authorizeRoles(...STAFF_ROLES), reservationController.updateStatus);
router.put('/:id', auth, authorizeRoles(...STAFF_ROLES), reservationController.update);
router.delete('/:id', auth, authorizeRoles(...STAFF_ROLES), reservationController.remove);

module.exports = router;
