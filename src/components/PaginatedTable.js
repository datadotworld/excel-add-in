// @flow
import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import {
  Panel,
  ListGroup,
  ListGroupItem,
  Pagination,
  Table
} from 'react-bootstrap'
import classes from './PaginatedTable.css'
import LoadingAnimation from './LoadingAnimation'

type PaginatedTableProps = {
  page: number,
  limit: number,
  itemTotal: number,
  handlePage: Function,
  analyticsId: string,
  analyticsLocation?: string,
  className?: string,
  header?: any,
  beforeList?: any,
  afterList?: any,
  listControls?: any,
  loading?: boolean,
  loadingBody? : any, // node should be wrapped in tbody tags and follow standard table syntax
  emptyState?: any,
  maxPages?: number,
  showMetaWhenEmpty?: boolean,
  showBeforeWhenEmpty?: boolean,
  thead: any, // node should actually be wrapped in thead tags and follow standard table syntax
  tbody: any // node should be wrapped in tbody tags and follow standard table syntax
}

class PaginatedTable extends React.Component<PaginatedTableProps> {
  handlePageChange = (newPage: number) => {
    // call original handlePage sent to component
    if (this.props.handlePage) {
      this.props.handlePage(newPage)
    }
  }

  render () {
    const {
      page,
      limit,
      itemTotal,
      className,
      header,
      beforeList,
      afterList,
      listControls,
      loading,
      loadingBody,
      emptyState,
      maxPages,
      showMetaWhenEmpty,
      showBeforeWhenEmpty,
      thead,
      tbody
    } = this.props

    // show loading body if loading and loading body is provided
    if (loading && loadingBody) {
      return <Panel className='dw-PaginatedTable' header={header}>
        <ListGroup fill>
          <div>
            <div className={classes.loadingOverlay} />
            {beforeList}
            <Table responsive hover className={classes.table}>
              {thead}
              {loadingBody}
            </Table>
            {afterList}
          </div>
        </ListGroup>
      </Panel>
    }

    // show spinner while loading
    if (loading) {
      return <Panel className='dw-PaginatedTable' header={header}>
        <LoadingAnimation hideOverlay nested />
      </Panel>
    }

    // show empty state
    if (!showMetaWhenEmpty && (itemTotal === 0)) {
      return <Panel className='dw-PaginatedTable' header={header}>
        {showBeforeWhenEmpty && beforeList}
        {emptyState}
      </Panel>
    }

    // helper calculations
    const totalPages = Math.ceil(itemTotal / limit)
    const multiplePages = totalPages > 1
    const lastPage = page * limit >= itemTotal
    const displayedItemsStart = itemTotal ? (page - 1) * limit + 1 : '0'
    const displayedItemsEnd = lastPage ? itemTotal : (page - 1) * limit + limit
    const adjustedTotalPages = maxPages ? Math.min(totalPages, maxPages) : totalPages

    // calculate displayed item range information
    const paginationMeta = <ListGroupItem className={classes.meta}>
      <small className='text-muted'>
        <FormattedMessage
          id='paginated_table.items_panel_header'
          description='Pagination metadata'
          defaultMessage='{start, number}–{end, number} of {total, number}'
          values={{
            start: displayedItemsStart || 1,
            end: displayedItemsEnd || 0,
            total: itemTotal || 0
          }}
        />
      </small>
      <div className={classes.listControls}>
        {listControls}
      </div>
    </ListGroupItem>

    // calculated pagination controls
    const paginationFooter = multiplePages && <nav className={classes.pagination}>
      <Pagination
        bsSize='small'
        maxButtons={3}
        items={adjustedTotalPages}
        onSelect={this.handlePageChange}
        activePage={page}
        boundaryLinks
        prev='❮'
        next='❯'
      />
    </nav>

    const content = () => {
      if (showMetaWhenEmpty && (itemTotal === 0) && emptyState) {
        return <div>
          <ListGroupItem>
            {emptyState}
          </ListGroupItem>
          {paginationMeta}
        </div>
      } else {
        return <div>
          {beforeList}
          <Table responsive hover className={classes.table}>
            {thead}
            {tbody}
          </Table>
          {afterList}
          {paginationMeta}
        </div>
      }
    }

    return (<Panel className='dw-PaginatedTable' header={header} footer={paginationFooter}>
      <ListGroup fill>
        {content()}
      </ListGroup>
    </Panel>)
  }
}

export default PaginatedTable
