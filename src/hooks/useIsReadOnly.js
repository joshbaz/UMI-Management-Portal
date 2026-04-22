import { useGetLoggedInUserDetails } from '../store/tanstackStore/services/queries';

/**
 * Custom hook to check if the current user has read-only permissions.
 * Currently, only the AUDITOR role is read-only.
 */
export const useIsReadOnly = () => {
    const { data: userDetails } = useGetLoggedInUserDetails();
    const role = userDetails?.user?.role;
    
    return role === 'AUDITOR';
};
