USE [galaxy_new]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		bonic
-- Create date: 2017-04-20
-- Description:	Get CoMIT Components for a given Tag Id
-- =============================================
ALTER PROCEDURE [dbo].[uspComitGetComponentsByTagId] (@tagId uniqueidentifier)

AS 

SELECT [CoMIT_Component].[Id], [CoMIT_Component].[Name], [CoMIT_ComponentType].[Name] AS [Type] FROM [CoMIT_Component]
	INNER JOIN [CoMIT_TagComponent] ON [CoMIT_Component].[Id] = [CoMIT_TagComponent].[ComponentId]
	INNER JOIN [Tag] ON [CoMIT_TagComponent].[TagId] = [Tag].[Id]
	INNER JOIN [CoMIT_ComponentType] ON [CoMIT_Component].[ComponentTypeId] = [CoMIT_ComponentType].[Id]
WHERE [Tag].[Id] = @tagId