import { validatorFactory } from '../../../utils/reduxForm';

const schema = {
  firstName: { presence: true },
  lastName: { presence: true },
  email: { presence: true, email: true },
  protocols: { presence: true,
    length: {
      minimum: 2,
      tooShort: 'Please select protocol.',
    },
  },
};

export default validatorFactory(schema);
