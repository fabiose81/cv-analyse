import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import ModalComponent from '../components/ModalComponent'
import { Constants } from '../utils/Constants';
import { setMessageState } from '../utils/UIUtils'
import { create } from '../services/Request'

const Job = () => {

  const [title, setTitle] = useState('');
  const [criteria, setCriteria] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(true)
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState({
    label: '',
    variant: ''
  });

  const createJob = () => {
    setShowModal(true);
    create(title, criteria)
      .then((response) => {
        setMessage(() => setMessageState(response, Constants.ALERT_SUCCESS));
      }).catch((error) => {
        setMessage(() => setMessageState(error, Constants.ALERT_DANGER));
      }).finally(() => {
        setShowModal(false);
      });
  };

  return (
    <>
      <Alert variant={message.variant} hidden={message.label === ''}>{message.label}</Alert>
      <Form.Group className="mb-3">
        <Form.Control  placeholder="Enter job title. Ex: stingray-opportunity-dev-java"
          value={title} onChange={(e) => {
            setTitle(e.target.value)
            const emptyField = e.target.value.trim().length > 0;
            setButtonDisabled(!emptyField);
          }
          }
          maxLength={100}
          required />

          <br/>

          <Form.Control placeholder="Enter job criteria. Ex: java, spring"
          value={criteria} onChange={(e) => {
            setCriteria(e.target.value)
            const emptyField = e.target.value.trim().length > 0;
            setButtonDisabled(!emptyField);
          }
          }
          maxLength={150}
          required />

        <br/>

        <Button className="button" variant="primary" onClick={createJob} disabled={buttonDisabled}>{Constants.SAVE}</Button>
      </Form.Group>
      <ModalComponent showModal={showModal} label={Constants.MODAL_LABEL_CREATE} />
    </>
  )
}

export default Job