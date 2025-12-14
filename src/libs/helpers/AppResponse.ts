import { Request } from 'express';
import { SelectQueryBuilder } from 'typeorm';

class AppResponse {
  public data(data: any) {
    return {
      status: 'SUCCESS',
      data,
    };
  }

  protected async applyHTEAOS(
    request: Request,
    queryBuilder: SelectQueryBuilder<any>,
  ) {
    const { query } = request;

    const { page, perPage } = query;

    const currentPage = +page || 1;
    const itemsPerPage = +perPage || 10;

    const offset = (currentPage - 1) * itemsPerPage;

    queryBuilder.skip(offset).take(itemsPerPage);

    const [data, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / itemsPerPage);
    const nextPage = currentPage < totalPages ? +currentPage + 1 : null;
    const prevPage = currentPage > 1 ? currentPage - 1 : null;

    let baseUrl = request.originalUrl;
    baseUrl = baseUrl.split('?').shift();

    const domain = request.get('host');
    const protocol = request.protocol;
    baseUrl = `${protocol}://${domain}${baseUrl}`;

    const currentPageUrl = `${baseUrl}?page=${currentPage}&perPage=${itemsPerPage}`;
    const previousPageUrl = prevPage
      ? `${baseUrl}?page=${prevPage}&perPage=${itemsPerPage}`
      : null;
    const nextPageUrl = nextPage
      ? `${baseUrl}?page=${nextPage}&perPage=${itemsPerPage}`
      : null;

    const response = {
      current_page: +currentPage,
      total_pages: totalPages,
      data,
      first_page_url: `${baseUrl}?page=1&perPage=${itemsPerPage}`,
      from: offset + 1,
      last_page: totalPages,
      last_page_url: `${baseUrl}?page=${totalPages}&perPage=${itemsPerPage}`,
      links: [
        { url: previousPageUrl, label: '&laquo; Previous', active: !!prevPage },
        { url: currentPageUrl, label: currentPage, active: true },
        { url: nextPageUrl, label: 'Next &raquo;', active: !!nextPage },
      ],
      next_page_url: nextPage
        ? `${baseUrl}?page=${nextPage}&perPage=${itemsPerPage}`
        : null,
      path: `${baseUrl}`,
      per_page: +perPage,
      prev_page_url: prevPage
        ? `${baseUrl}?page=${prevPage}&perPage=${itemsPerPage}`
        : null,
      to: offset + data.length,
      total,
    };

    return {
      status: 'SUCCESS',
      ...response,
    };
  }
}

export default AppResponse;
