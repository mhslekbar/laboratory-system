<div className="flex flex-col border">
<div className="overflow-x-auto"> {/* sm:-mx-6 lg:-mx-8 */}
  <div className="inline-block min-w-full sm:px-6 lg:px-8">
    <div className="overflow-hidden">
      <table className="min-w-full text-left text-sm font-light">
        <thead className="border-b font-medium bg-main text-white">
          <tr>
            <th className="px-6 py-4">Nom</th>

            <th className="px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => (
            <tr className="border-b" key={index}>
              <td className="whitespace-nowrap px-4 py-2 border-r font-medium">
                {category.name}
              </td>                        
              <td>
                
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>
</div>