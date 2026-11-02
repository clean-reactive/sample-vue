import type { Controller, OrderParams } from '../Order.types'
import { useDeleteOrderUseCase } from '../../../composables'

/**
 * Adapts UI events to application use cases. Business orchestration stays in
 * the use case; this controller only supplies the order ID.
 */
export const useController = (params: OrderParams): Controller => {
  const { execute: executeDeleteOrderUseCase } = useDeleteOrderUseCase(params)

  const deleteOrderButtonClicked = () => {
    void executeDeleteOrderUseCase()
  }

  return { deleteOrderButtonClicked }
}
