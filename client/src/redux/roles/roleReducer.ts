import { RoleStatus, RoleAction } from "./roleActions";

const initialState = {
  isFetching: false,
  roles: [],
  error: [],
};

type STATE = typeof initialState;

const reducer = (state: STATE = initialState, action: RoleAction) => {
  switch(action.type.name) {
    case "role": 
    switch (action.status) {
      case RoleStatus.START:
        return {
          ...state,
          isFetching: true,
          error: [],
        };
  
      case RoleStatus.SUCCESS:
        return {
          ...state,
          isFetching: false,
          roles: action.payload,
          error: [],
        };
  
      case RoleStatus.FAILURE:
        return {
          ...state,
          isFetching: false,
          roles: action.payload ? action.payload[0]?.startsWith("AFFICHER") ? [] : state.roles : state.roles,
          error: action.payload,
        };
      default: return state
    }
    default: return state 
  }
};

export default reducer

/**
 

    case RoleType.SHOW_ROLES:
      switch (action.status) { // start switch show
        case RoleStatus.START:
          return {
            ...state,
            isFetching: true,
            error: [],
          };

        case RoleStatus.SUCCESS:
          return {
            ...state,
            isFetching: false,
            roles: action.payload,
            error: [],
          };

        case RoleStatus.FAILURE:
          return {
            ...state,
            isFetching: false,
            error: action.payload,
          };
      } // end switch show
    break;


*/