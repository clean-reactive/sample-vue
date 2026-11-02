import type { UseCase } from '../../../../@types'
import { useDeleteOrderMutation, type OrderEntityId } from '../../repositories'

/**
 * Application-level delete operation. It owns mutation orchestration and the
 * error boundary, keeping those concerns out of the controller and repository.
 */
export const useDeleteOrderUseCase = (params: { orderId: OrderEntityId }): UseCase => {
  const { mutateAsync: deleteOrder } = useDeleteOrderMutation()

  const execute = async () => {
    try {
      await deleteOrder({ orderId: params.orderId })
    } catch (error: unknown) {
      console.error(error)
    }
  }

  return { execute }
}
