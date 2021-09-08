import sinon from 'sinon';

const patientService = sinon.stub({
  addPatient: () => {},
  getPatientId: () => {},
  getPatientName: () => {},
  getPatientIdByUserId: () => {},
});

export default patientService;